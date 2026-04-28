import Review from '../models/Review.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import ArtisanProfile from '../models/ArtisanProfile.js';
import { createError } from '../middleware/error.middleware.js';
import { recalculateProductRating, recalculateArtisanRating } from '../utils/calculateRating.js';

export async function createReview(req, res, next) {
  try {
    const { productId, orderId, rating, title, body, images, subRatings } = req.body;
    const order = await Order.findOne({
      _id: orderId,
      customer: req.user.userId,
      status: 'delivered',
    });
    if (!order) {
      throw createError(400, 'You can only review products from delivered orders.');
    }
    const orderItem = order.items.find(i => i.product.toString() === productId);
    if (!orderItem) {
      throw createError(400, 'This product was not in the specified order.');
    }
    const existingReview = await Review.findOne({
      reviewer: req.user.userId,
      product: productId,
      order: orderId,
    });
    if (existingReview) {
      throw createError(409, 'You have already reviewed this product for this order.');
    }
    const review = await Review.create({
      reviewer: req.user.userId,
      product: productId,
      artisan: orderItem.artisan,
      order: orderId,
      rating,
      title,
      body,
      images: images || [],
      subRatings,
      isVerifiedPurchase: true,
    });
    await recalculateProductRating(Product, productId);
    await recalculateArtisanRating(ArtisanProfile, orderItem.artisan);
    return res.status(201).json({ message: 'Review submitted.', review });
  } catch (err) {
    next(err);
  }
}
export async function getProductReviews(req, res, next) {
  try {
    const { page = 1, limit = 10, sort = 'newest' } = req.query;
    const sortMap = {
      newest: { createdAt: -1 },
      highest: { rating: -1 },
      lowest: { rating: 1 },
      helpful: { helpfulVotes: -1 },
    };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = { product: req.params.productId, isVisible: true };
    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .sort(sortMap[sort] || sortMap.newest)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('reviewer', 'name avatar')
        .lean(),
      Review.countDocuments(filter),
    ]);
    return res.json({
      reviews,
      pagination: { total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
}
export async function replyToReview(req, res, next) {
  try {
    const { content } = req.body;
    const review = await Review.findById(req.params.id);
    if (!review) throw createError(404, 'Review not found.');
    if (review.artisanReply?.content) {
      throw createError(409, 'You have already replied to this review.');
    }
    review.artisanReply = { content, repliedAt: new Date() };
    await review.save();
    return res.json({ message: 'Reply posted.', review });
  } catch (err) {
    next(err);
  }
}
export async function deleteReview(req, res, next) {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) throw createError(404, 'Review not found.');
    review.isVisible = false;
    await review.save();
    await recalculateProductRating(Product, review.product);
    await recalculateArtisanRating(ArtisanProfile, review.artisan);
    return res.json({ message: 'Review hidden.' });
  } catch (err) {
    next(err);
  }
}