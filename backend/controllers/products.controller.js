import Product from '../models/Product.js';
import { AppError } from '../utils/AppError.js';

export const getAllProducts = async (req, res, next) => {
    try {
        const queryObj = { ...req.query };
        const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
        excludedFields.forEach(el => delete queryObj[el]);
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        let query = Product.find(JSON.parse(queryStr));
        if (req.query.search) {
            query = query.find({
                $text: { $search: req.query.search }
            });
        }
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }
        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 12;
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);
        const products = await query.populate('artisan', 'name profileImage');
        res.status(200).json({
            status: 'success',
            results: products.length,
            data: products
        });
    } catch (error) {
        next(error);
    }
};

export const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { $inc: { viewCount: 1 } },
            { new: true }
        ).populate('artisan').populate('originStory');
        if (!product) return next(new AppError('Product not found', 404));
        res.status(200).json({
            status: 'success',
            data: product
        });
    } catch (error) {
        next(error);
    }
};

export const createProduct = async (req, res, next) => {
    try {
        const newProduct = await Product.create({
            ...req.body,
            artisan: req.user.id
        });
        res.status(201).json({
            status: 'success',
            data: newProduct
        });
    } catch (error) {
        next(error);
    }
};

export const updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findOneAndUpdate(
            { _id: req.params.id, artisan: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!product) return next(new AppError('Product not found or unauthorized', 404));
        res.status(200).json({
            status: 'success',
            data: product
        });
    } catch (error) {
        next(error);
    }
};

export const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findOne({ _id: req.params.id });
        if (!product) return next(new AppError('Product not found', 404));
        if (req.user.role !== 'admin' && product.artisan.toString() !== req.user.id) {
            return next(new AppError('Not authorized to delete this product', 403));
        }
        product.isActive = false;
        await product.save();
        res.status(200).json({
            status: 'success',
            message: 'Product soft-deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const toggleFeatured = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return next(new AppError('Product not found', 404));
        product.isFeatured = !product.isFeatured;
        await product.save();
        res.status(200).json({
            status: 'success',
            isFeatured: product.isFeatured
        });
    } catch (error) {
        next(error);
    }
};