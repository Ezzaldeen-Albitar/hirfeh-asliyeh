import User from '../models/User.js';
import ArtisanProfile from '../models/ArtisanProfile.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import Badge from '../models/Badge.js';
import { createError } from '../middleware/error.middleware.js';

const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const COD_REVENUE_STATUSES = ['confirmed', 'in-progress', 'shipped', 'delivered'];

function buildSuccessfulOrderMatch(extraMatch = {}) {
  return {
    ...extraMatch,
    $or: [
      { paymentStatus: 'paid' },
      { paymentMethod: 'cash_on_delivery', status: { $in: COD_REVENUE_STATUSES } },
    ],
  };
}

function buildMonthBuckets(monthCount = 6, baseDate = new Date()) {
  const currentMonthStart = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  return Array.from({ length: monthCount }, (_, index) => {
    const date = new Date(currentMonthStart.getFullYear(), currentMonthStart.getMonth() - (monthCount - 1 - index), 1);
    return {
      date,
      key: `${date.getFullYear()}-${date.getMonth() + 1}`,
      label: MONTHS_AR[date.getMonth()],
    };
  });
}

function buildMonthlyCountPipeline(startDate, valueField = 'count') {
  return [
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        [valueField]: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ];
}

function buildMonthlyRevenuePipeline(startDate) {
  return [
    { $match: buildSuccessfulOrderMatch({ createdAt: { $gte: startDate } }) },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        revenue: { $sum: '$totalAmount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ];
}

function buildMonthlyValueMap(aggregateRows, valueField) {
  return new Map(
    aggregateRows.map((row) => [`${row._id.year}-${row._id.month}`, row[valueField] || 0])
  );
}

function buildTrendSeries(monthBuckets, valuesMap) {
  return monthBuckets.map((bucket) => ({
    label: bucket.label,
    value: valuesMap.get(bucket.key) || 0,
  }));
}

function formatPercentChange(currentValue, previousValue) {
  if (!currentValue && !previousValue) return '+0%';
  if (!previousValue) return '+100%';
  const rawChange = ((currentValue - previousValue) / previousValue) * 100;
  const rounded = Math.round(rawChange * 10) / 10;
  const printable = Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(1);
  return `${rounded >= 0 ? '+' : ''}${printable}%`;
}

function getTrailingComparison(trendSeries) {
  const currentValue = trendSeries.at(-1)?.value || 0;
  const previousValue = trendSeries.at(-2)?.value || 0;
  return formatPercentChange(currentValue, previousValue);
}

export async function verifyArtisan(req, res, next) {
  try {
    const artisan = await ArtisanProfile.findById(req.params.id).populate('user', 'name email');
    if (!artisan) throw createError(404, 'ملف الحرفي غير موجود.');
    artisan.isVerified = true;
    await artisan.save();
    const { sendArtisanVerifiedEmail } = await import('../services/mailer.service.js');
    try {
      await sendArtisanVerifiedEmail(artisan.user.email, artisan.user.name);
    } catch (e) {
      console.error('Artisan verification email failed:', e.message);
    }
    return res.json({ message: 'تم توثيق الحرفي.', artisan });
  } catch (err) {
    next(err);
  }
}

export async function getDashboardStats(req, res, next) {
  try {
    const monthBuckets = buildMonthBuckets(6);
    const monthlyStartDate = monthBuckets[0].date;
    const [
      totalUsers,
      totalArtisans,
      totalVerifiedArtisans,
      pendingVerifications,
      totalProducts,
      totalOrders,
      revenueResult,
      recentOrders,
      usersMonthly,
      artisansMonthly,
      ordersMonthly,
      revenueMonthly,
      categoryStats,
    ] = await Promise.all([
      User.countDocuments(),
      ArtisanProfile.countDocuments(),
      ArtisanProfile.countDocuments({ isVerified: true }),
      ArtisanProfile.countDocuments({ isVerified: false }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: buildSuccessfulOrderMatch() },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('customer', 'name email avatar')
        .lean(),
      User.aggregate(buildMonthlyCountPipeline(monthlyStartDate)),
      ArtisanProfile.aggregate(buildMonthlyCountPipeline(monthlyStartDate)),
      Order.aggregate(buildMonthlyCountPipeline(monthlyStartDate)),
      Order.aggregate(buildMonthlyRevenuePipeline(monthlyStartDate)),
      Order.aggregate([
        { $match: buildSuccessfulOrderMatch() },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.product',
            foreignField: '_id',
            as: 'productInfo',
          },
        },
        { $unwind: '$productInfo' },
        {
          $group: {
            _id: '$productInfo.category',
            totalSales: { $sum: '$items.quantity' },
            totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          },
        },
        { $sort: { totalRevenue: -1 } },
      ]),
    ]);

    const userTrend = buildTrendSeries(monthBuckets, buildMonthlyValueMap(usersMonthly, 'count'));
    const artisanTrend = buildTrendSeries(monthBuckets, buildMonthlyValueMap(artisansMonthly, 'count'));
    const orderTrend = buildTrendSeries(monthBuckets, buildMonthlyValueMap(ordersMonthly, 'count'));
    const revenueTrend = buildTrendSeries(monthBuckets, buildMonthlyValueMap(revenueMonthly, 'revenue'));
    const revenueChart = revenueTrend.map((point) => ({
      month: point.label,
      label: point.label,
      revenue: point.value,
    }));
    const totalRevenue = revenueResult[0]?.total || 0;

    return res.json({
      stats: {
        users: totalUsers,
        totalUsers,
        artisans: totalArtisans,
        totalArtisans,
        verifiedArtisans: totalVerifiedArtisans,
        totalVerifiedArtisans,
        pendingVerifications,
        products: totalProducts,
        totalProducts,
        orders: totalOrders,
        totalOrders,
        revenue: totalRevenue,
        totalRevenue,
        usersChange: getTrailingComparison(userTrend),
        artisansChange: getTrailingComparison(artisanTrend),
        ordersChange: getTrailingComparison(orderTrend),
        revenueChange: getTrailingComparison(revenueTrend),
        trends: {
          users: userTrend.map((point) => point.value),
          artisans: artisanTrend.map((point) => point.value),
          orders: orderTrend.map((point) => point.value),
          revenue: revenueTrend.map((point) => point.value),
        },
      },
      recentOrders,
      revenueChart,
      salesLast30Days: revenueChart,
      categoryStats,
    });
  } catch (err) {
    next(err);
  }
}
export async function getUsers(req, res, next) {
  try {
    const { page = 1, limit = 20, role, search, banned } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (banned === 'true') filter.isBanned = true;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-password -emailOtp -passwordResetOtp')
        .lean(),
      User.countDocuments(filter),
    ]);
    return res.json({
      users,
      pagination: { total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
}
export async function toggleBanUser(req, res, next) {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) throw createError(404, 'المستخدم غير موجود.');
    if (user.role === 'admin') throw createError(403, 'لا يمكن حظر حساب مدير.');
    user.isBanned = !user.isBanned;
    if (user.isBanned) {
      user.bannedReason = reason || 'Violation of terms of service.';
    } else {
      user.bannedReason = undefined;
    }
    await user.save();
    return res.json({
      message: `User ${user.isBanned ? 'banned' : 'unbanned'}.`,
      user: { _id: user._id, name: user.name, isBanned: user.isBanned },
    });
  } catch (err) {
    next(err);
  }
}

export async function getPendingArtisans(req, res, next) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [artisans, total] = await Promise.all([
      ArtisanProfile.find({ isVerified: false })
        .sort({ createdAt: 1 }) 
        .skip(skip)
        .limit(parseInt(limit))
        .populate('user', 'name email avatar createdAt')
        .lean(),
      ArtisanProfile.countDocuments({ isVerified: false }),
    ]);
    return res.json({
      artisans,
      pagination: { total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
}

export async function getAdminProducts(req, res, next) {
  try {
    const { page = 1, limit = 20, isActive, isFeatured } = req.query;
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('artisan', 'craftName region isVerified')
        .lean(),
      Product.countDocuments(filter),
    ]);
    return res.json({
      products,
      pagination: { total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
}

export async function getBadges(req, res, next) {
  try {
    const badges = await Badge.find({ isActive: true }).lean();
    return res.json({ badges });
  } catch (err) {
    next(err);
  }
}

export async function createBadge(req, res, next) {
  try {
    const badge = await Badge.create(req.body);
    return res.status(201).json({ message: 'تم إنشاء الشارة.', badge });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw createError(404, 'المستخدم غير موجود.');
    if (user.role === 'admin') throw createError(403, 'لا يمكن حذف حساب المدير.');
    if (user._id.toString() === req.user.userId) throw createError(403, 'لا يمكنك حذف حسابك الشخصي.');
    
    await User.findByIdAndDelete(req.params.id);
    if (user.role === 'artisan') {
      await ArtisanProfile.findOneAndDelete({ user: user._id });
    }
    
    return res.json({ message: 'تم حذف المستخدم بنجاح.' });
  } catch (err) {
    next(err);
  }
}

export async function updateUserRole(req, res, next) {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) throw createError(404, 'المستخدم غير موجود.');
    
    if (user._id.toString() === req.user.userId && role !== 'admin') {
      throw createError(403, 'لا يمكنك تغيير دورك من مدير إلى دور آخر بنفسك.');
    }
    user.role = role;
    await user.save();
    
    return res.json({ message: 'تم تحديث دور المستخدم.', user: { _id: user._id, role: user.role } });
  } catch (err) {
    next(err);
  }
}
