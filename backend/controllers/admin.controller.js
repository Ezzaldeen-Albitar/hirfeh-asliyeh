import User from '../models/User.js';
import ArtisanProfile from '../models/ArtisanProfile.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import Badge from '../models/Badge.js';
import { createError } from '../middleware/error.middleware.js';

export async function getDashboardStats(req, res, next) {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [
      totalUsers,
      totalArtisans,
      totalVerifiedArtisans,
      pendingVerifications,
      totalProducts,
      totalOrders,
      revenueResult,
      recentOrders,
      salesLast30Days,
      categoryStats,
    ] = await Promise.all([
      User.countDocuments(),
      ArtisanProfile.countDocuments(),
      ArtisanProfile.countDocuments({ isVerified: true }),
      ArtisanProfile.countDocuments({ isVerified: false }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('customer', 'name email avatar')
        .lean(),
      Order.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo }, paymentStatus: 'paid' } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$totalAmount' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
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
    return res.json({
      stats: {
        totalUsers,
        totalArtisans,
        totalVerifiedArtisans,
        pendingVerifications,
        totalProducts,
        totalOrders,
        totalRevenue: revenueResult[0]?.total || 0,
      },
      recentOrders,
      salesLast30Days,
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
    if (!user) throw createError(404, 'User not found.');
    if (user.role === 'admin') throw createError(403, 'Cannot ban an admin.');
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
    return res.status(201).json({ message: 'Badge created.', badge });
  } catch (err) {
    next(err);
  }
}
