import User from '../models/User.js';
import Product from '../models/Product.js';
import { createError } from '../middleware/error.middleware.js';

export async function getWishlist(req, res, next) {
  try {
    const user = await User.findById(req.user.userId)
      .populate({
        path: 'wishlist',
        match: { isActive: true },
        populate: [
          {
            path: 'artisan',
            select: 'craftName region profileImage user',
            populate: { path: 'user', select: 'name avatar' },
          },
          { path: 'originStory', select: 'certificateNumber origin.region' },
        ],
      })
      .lean();

    if (!user) throw createError(404, 'User not found.');

    return res.json({ wishlist: user.wishlist || [] });
  } catch (err) {
    next(err);
  }
}

export async function addToWishlist(req, res, next) {
  try {
    const { productId } = req.body;
    if (!productId) throw createError(400, 'productId is required.');

    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) throw createError(404, 'Product not found.');

    const user = await User.findById(req.user.userId);
    if (!user) throw createError(404, 'User not found.');

    const alreadyExists = user.wishlist.some((id) => id.toString() === productId);
    if (alreadyExists) {
      return res.status(409).json({ message: 'Product already in wishlist.' });
    }

    user.wishlist.push(product._id);
    await user.save();

    return res.status(201).json({
      message: 'Product added to wishlist.',
      productId: product._id,
    });
  } catch (err) {
    next(err);
  }
}

export async function removeFromWishlist(req, res, next) {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user.userId);
    if (!user) throw createError(404, 'User not found.');

    user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
    await user.save();

    return res.json({
      message: 'Product removed from wishlist.',
      productId,
    });
  } catch (err) {
    next(err);
  }
}
