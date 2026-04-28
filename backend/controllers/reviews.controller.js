import Review from '../models/Review.js';
import Product from '../models/Product.js';
import { AppError } from '../utils/AppError.js';

export const createReview = async (req, res, next) => {
    try {
        const { rating, comment, product } = req.body;
        const existingReview = await Review.findOne({
            user: req.user.id,
            product: product
        });
        if (existingReview) {
            return next(new AppError('You have already reviewed this product', 400));
        }
        const review = await Review.create({
            rating,
            comment,
            product,
            user: req.user.id
        });
        res.status(201).json({
            status: 'success',
            data: review
        });
    } catch (error) {
        next(error);
    }
};

export const getProductReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({ product: req.params.productId })
            .populate('user', 'name profileImage')
            .sort('-createdAt');
        res.status(200).json({
            status: 'success',
            results: reviews.length,
            data: reviews
        });
    } catch (error) {
        next(error);
    }
};

export const updateReview = async (req, res, next) => {
    try {
        const review = await Review.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { rating: req.body.rating, comment: req.body.comment },
            { new: true, runValidators: true }
        );
        if (!review) {
            return next(new AppError('Review not found or unauthorized', 404));
        }
        res.status(200).json({
            status: 'success',
            data: review
        });
    } catch (error) {
        next(error);
    }
};

export const deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        });
        if (!review) {
            return next(new AppError('Review not found or unauthorized', 404));
        }
        res.status(200).json({
            status: 'success',
            message: 'Review deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const getMyReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({ user: req.user.id })
            .populate('product', 'title mainImage');
        res.status(200).json({
            status: 'success',
            results: reviews.length,
            data: reviews
        });
    } catch (error) {
        next(error);
    }
};