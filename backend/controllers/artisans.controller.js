import ArtisanProfile from '../models/ArtisanProfile.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Badge from '../models/Badge.js';
import { createError } from '../middleware/error.middleware.js';
import { createAndEmitNotification } from '../services/notification.service.js';
import { sendArtisanVerifiedEmail } from '../services/mailer.service.js';
import {
  getDefaultArtisanCoverImage,
  isAutoArtisanCoverImage,
  normalizeCraftSpecialty,
} from '../utils/artisanProfileDefaults.js';

const REGION_ALIASES = {
  'عمان': 'عمّان',
  'عمّان': 'عمّان',
  'اربد': 'إربد',
  'إربد': 'إربد',
  'الزرقاء': 'الزرقاء',
  'مادبا': 'مأدبا',
  'مأدبا': 'مأدبا',
  'جرش': 'جرش',
  'عجلون': 'عجلون',
  'البلقاء': 'البلقاء',
  'الكرك': 'الكرك',
  'الطفيلة': 'الطفيلة',
  'معان': 'معان',
  'العقبة': 'العقبة',
  'السلط': 'السلط',
};

const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

function normalizeRegion(region) {
  if (typeof region !== 'string') return region;
  const value = region.trim();
  return REGION_ALIASES[value] || value;
}

function resolveArtisanCoverImage(craftSpecialty, currentCoverImage) {
  if (typeof currentCoverImage === 'string' && currentCoverImage.trim() && !isAutoArtisanCoverImage(currentCoverImage)) {
    return currentCoverImage.trim();
  }

  return getDefaultArtisanCoverImage(craftSpecialty);
}

function buildEmptyDashboard() {
  return {
    data: {
      revenue: 0,
      orders: 0,
      views: 0,
      products: 0,
      revenueChange: '+0%',
      ordersChange: '+0%',
      viewsChange: '+0%',
      productsChange: '+0',
    },
    revenueChart: [],
  };
}

function buildArtisanRevenueMatch(artisanId, extraMatch = {}) {
  return {
    ...extraMatch,
    'items.artisan': artisanId,
    $or: [
      { paymentStatus: 'paid' },
      { paymentMethod: 'cash_on_delivery', status: { $in: ['confirmed', 'in-progress', 'shipped', 'delivered'] } },
    ],
  };
}

export async function getArtisans(req, res, next) {
  try {
    const { region, verified, specialties, page = 1, limit = 12, sort = 'rating' } = req.query;
    const filter = { isActive: true };
    if (region) filter.region = normalizeRegion(region);
    if (verified === 'true') filter.isVerified = true;
    if (specialties) filter.specialties = { $in: specialties.split(',') };
    const sortMap = {
      rating: { rating: -1 },
      newest: { createdAt: -1 },
      sales: { totalSales: -1 },
    };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [artisans, total] = await Promise.all([
      ArtisanProfile.find(filter)
        .sort(sortMap[sort] || sortMap.rating)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('user', 'name avatar')
        .populate('badges', 'nameAr nameEn icon')
        .lean(),
      ArtisanProfile.countDocuments(filter),
    ]);
    return res.json({
      artisans,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
}

export async function getArtisan(req, res, next) {
  try {
    const artisan = await ArtisanProfile.findById(req.params.id)
      .populate('user', 'name avatar email')
      .populate('badges');
    if (!artisan || !artisan.isActive) throw createError(404, 'Artisan not found.');
    return res.json({ artisan });
  } catch (err) {
    next(err);
  }
}

export async function applyAsArtisan(req, res, next) {
  try {
    const existing = await ArtisanProfile.findOne({ user: req.user.userId });
    if (existing) {
      return res.status(409).json({ message: 'You already have an artisan profile.' });
    }
    const craftName = normalizeCraftSpecialty(
      req.body.craftName || req.body.craftSpecialty || req.body.specialties?.[0]
    );
    const artisan = await ArtisanProfile.create({
      user: req.user.userId,
      ...req.body,
      ...(craftName ? { craftName, specialties: [craftName] } : {}),
      region: normalizeRegion(req.body.region),
      coverImage: resolveArtisanCoverImage(craftName, req.body.coverImage),
      isVerified: false,
    });
    await User.findByIdAndUpdate(req.user.userId, { role: 'artisan' });
    return res.status(201).json({
      message: 'Artisan profile created. Pending verification by admin.',
      artisan,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateCurrentArtisanProfile(req, res, next) {
  try {
    const { name, phone, craftSpecialty, governorate, bio } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) throw createError(404, 'User not found.');

    let artisan = await ArtisanProfile.findOne({ user: req.user.userId });

    const incomingCraftSpecialty = normalizeCraftSpecialty(craftSpecialty);
    const craftName = incomingCraftSpecialty || artisan?.craftName || user.name;
    const region = normalizeRegion(
      (typeof governorate === 'string' && governorate.trim()) ||
      artisan?.region ||
      user.address?.governorate
    );
    const specialties = incomingCraftSpecialty ? [incomingCraftSpecialty] : artisan?.specialties || [];
    const safeBio = typeof bio === 'string' ? bio.trim() : artisan?.bio || '';

    if (!artisan) {
      if (!craftName || !region || !safeBio) {
        throw createError(400, 'Bio and governorate are required to create the artisan profile.');
      }
      artisan = await ArtisanProfile.create({
        user: req.user.userId,
        craftName,
        bio: safeBio,
        region,
        specialties,
        coverImage: resolveArtisanCoverImage(craftName, ''),
        isVerified: false,
      });
    } else {
      if (safeBio) artisan.bio = safeBio;
      if (craftName) artisan.craftName = craftName;
      if (region) artisan.region = region;
      artisan.specialties = specialties;
      artisan.coverImage = resolveArtisanCoverImage(craftName, artisan.coverImage);
      await artisan.save();
    }

    if (typeof name === 'string') user.name = name.trim();
    if (typeof phone === 'string') user.phone = phone.trim();
    if (region) {
      user.address = user.address || {};
      user.address.governorate = region;
    }
    if (artisan) {
      user.pendingArtisanProfile = undefined;
    }
    await user.save();

    return res.json({
      message: 'Profile updated.',
      user,
      artisanProfile: artisan,
    });
  } catch (err) {
    next(err);
  }
}

export async function getCurrentArtisanDashboard(req, res, next) {
  try {
    const artisan = await ArtisanProfile.findOne({ user: req.user.userId });
    if (!artisan) {
      return res.json(buildEmptyDashboard());
    }

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5, 1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [productCount, productViews, ordersCount, revenueResult, monthlyRevenue] = await Promise.all([
      Product.countDocuments({ artisan: artisan._id, isActive: true }),
      Product.aggregate([
        { $match: { artisan: artisan._id } },
        { $group: { _id: null, totalViews: { $sum: '$viewCount' } } },
      ]),
      Order.countDocuments({ 'items.artisan': artisan._id }),
      Order.aggregate([
        { $match: buildArtisanRevenueMatch(artisan._id) },
        { $unwind: '$items' },
        { $match: { 'items.artisan': artisan._id } },
        {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          },
        },
      ]),
      Order.aggregate([
        { $match: buildArtisanRevenueMatch(artisan._id, { createdAt: { $gte: sixMonthsAgo } }) },
        { $unwind: '$items' },
        { $match: { 'items.artisan': artisan._id } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    const revenueMap = new Map(
      monthlyRevenue.map((item) => [`${item._id.year}-${item._id.month}`, item.revenue])
    );

    const revenueChart = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth() + index, 1);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      return {
        month: MONTHS_AR[date.getMonth()],
        revenue: revenueMap.get(key) || 0,
      };
    });

    return res.json({
      data: {
        revenue: revenueResult[0]?.total || 0,
        orders: ordersCount,
        views: productViews[0]?.totalViews || 0,
        products: productCount,
        revenueChange: '+0%',
        ordersChange: '+0%',
        viewsChange: '+0%',
        productsChange: '+0',
      },
      revenueChart,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateArtisan(req, res, next) {
  try {
    const artisan = await ArtisanProfile.findById(req.params.id);
    if (!artisan) throw createError(404, 'Artisan profile not found.');
    if (req.user.role !== 'admin' && !artisan.user.equals(req.user.userId)) {
      throw createError(403, 'Forbidden.');
    }
    delete req.body.isVerified;
    const updated = await ArtisanProfile.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    return res.json({ message: 'Profile updated.', artisan: updated });
  } catch (err) {
    next(err);
  }
}
export async function getArtisanStats(req, res, next) {
  try {
    const artisan = await ArtisanProfile.findById(req.params.id);
    if (!artisan) throw createError(404, 'Artisan not found.');
    if (req.user.role !== 'admin' && !artisan.user.equals(req.user.userId)) {
      throw createError(403, 'Forbidden.');
    }
    const [productCount, productViews, recentOrders, revenueResult] = await Promise.all([
      Product.countDocuments({ artisan: artisan._id, isActive: true }),
      Product.aggregate([
        { $match: { artisan: artisan._id } },
        { $group: { _id: null, totalViews: { $sum: '$viewCount' } } },
      ]),
      Order.find({ 'items.artisan': artisan._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('customer', 'name')
        .lean(),
      Order.aggregate([
        { $match: buildArtisanRevenueMatch(artisan._id) },
        { $unwind: '$items' },
        { $match: { 'items.artisan': artisan._id } },
        { $group: { _id: null, total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      ]),
    ]);
    return res.json({
      stats: {
        totalProducts: productCount,
        totalViews: productViews[0]?.totalViews || 0,
        totalSales: artisan.totalSales,
        totalRevenue: revenueResult[0]?.total || 0,
        rating: artisan.rating,
        reviewCount: artisan.reviewCount,
      },
      recentOrders,
    });
  } catch (err) {
    next(err);
  }
}
export async function verifyArtisan(req, res, next) {
  try {
    const { approved, rejectionReason } = req.body;
    const artisan = await ArtisanProfile.findById(req.params.id).populate('user');
    if (!artisan) throw createError(404, 'Artisan not found.');
    const io = req.app.get('io');
    if (approved) {
      artisan.isVerified = true;
      artisan.verifiedAt = new Date();
      artisan.rejectionReason = undefined;
      const badge = await Badge.findOne({ badgeType: 'verification' });
      if (badge && !artisan.badges.includes(badge._id)) {
        artisan.badges.push(badge._id);
      }
      await artisan.save();
      await createAndEmitNotification(
        artisan.user._id,
        {
          type: 'system',
          title: 'تم توثيق حسابك!',
          body: 'مبروك! تم قبول طلب توثيق متجرك في SouqJo.',
          link: '/dashboard/artisan',
        },
        io
      );
      try {
        await sendArtisanVerifiedEmail(artisan.user.email, artisan.user.name);
      } catch (e) {
        console.error('Email send failed:', e.message);
      }
      return res.json({ message: 'Artisan verified successfully.', artisan });
    } else {
      artisan.rejectionReason = rejectionReason;
      await artisan.save();
      await createAndEmitNotification(
        artisan.user._id,
        {
          type: 'system',
          title: 'تحديث طلب التوثيق',
          body: `لم يتم قبول طلب التوثيق. السبب: ${rejectionReason || 'يرجى مراجعة المتطلبات.'}`,
          link: '/dashboard/artisan',
        },
        io
      );
      return res.json({ message: 'Artisan verification rejected.' });
    }
  } catch (err) {
    next(err);
  }
}
export async function assignBadge(req, res, next) {
  try {
    const { badgeId } = req.body;
    const artisan = await ArtisanProfile.findById(req.params.id);
    if (!artisan) throw createError(404, 'Artisan not found.');
    const badge = await Badge.findById(badgeId);
    if (!badge) throw createError(404, 'Badge not found.');
    if (artisan.badges.includes(badgeId)) {
      return res.status(409).json({ message: 'Artisan already has this badge.' });
    }
    artisan.badges.push(badgeId);
    await artisan.save();
    const io = req.app.get('io');
    await createAndEmitNotification(
      artisan.user,
      {
        type: 'system',
        title: `حصلت على شارة: ${badge.nameAr}`,
        body: badge.description || 'تهانينا على هذا الإنجاز!',
        link: '/dashboard/artisan',
      },
      io
    );
    return res.json({ message: 'Badge assigned.', artisan });
  } catch (err) {
    next(err);
  }
}

export async function getFeaturedArtisans(req, res, next) {
  try {
    const { limit = 6 } = req.query;
    const artisans = await ArtisanProfile.find({ isActive: true, isVerified: true })
      .sort({ rating: -1, totalSales: -1 })
      .limit(parseInt(limit))
      .populate('user', 'name avatar')
      .populate('badges', 'nameAr nameEn icon')
      .lean();
    return res.json({ artisans });
  } catch (err) {
    next(err);
  }
}
