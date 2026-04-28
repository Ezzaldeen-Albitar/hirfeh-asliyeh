import Product from '../models/Product.js';
import ArtisanProfile from '../models/ArtisanProfile.js';
import OriginStory from '../models/OriginStory.js';
import { AppError } from '../utils/AppError.js';

export const globalSearch = async (req, res, next) => {
    try {
        const { q } = req.query;
        if (!q) {
            return next(new AppError('Search query is required', 400));
        }
        const searchQuery = { $regex: q, $options: 'i' };
        const [products, artisans, stories] = await Promise.all([
            Product.find({
                $or: [{ title: searchQuery }, { description: searchQuery }, { tags: searchQuery }]
            }).limit(10).select('title price mainImage'),
            ArtisanProfile.find({
                $or: [{ bio: searchQuery }, { specialties: searchQuery }]
            }).populate('user', 'name profileImage').limit(5),
            OriginStory.find({
                $or: [{ title: searchQuery }, { content: searchQuery }, { region: searchQuery }]
            }).limit(5)
        ]);
        res.status(200).json({
            status: 'success',
            data: {
                products,
                artisans,
                stories
            }
        });
    } catch (error) {
        next(error);
    }
};

export const searchSuggestions = async (req, res, next) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(200).json({ status: 'success', data: [] });
        const suggestions = await Product.find({
            title: { $regex: q, $options: 'i' }
        })
            .limit(8)
            .select('title');
        res.status(200).json({
            status: 'success',
            data: suggestions.map(s => s.title)
        });
    } catch (error) {
        next(error);
    }
};
export const advancedProductSearch = async (req, res, next) => {
    try {
        const {
            q,
            minPrice,
            maxPrice,
            category,
            region,
            rating
        } = req.query;
        let filter = { isActive: true };
        if (q) {
            filter.$or = [
                { title: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } }
            ];
        }
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }
        if (category) filter.category = category;
        if (region) filter.region = region;
        if (rating) filter.averageRating = { $gte: Number(rating) };
        const products = await Product.find(filter)
            .populate('artisan', 'name')
            .sort('-createdAt');
        res.status(200).json({
            status: 'success',
            results: products.length,
            data: products
        });
    } catch (error) {
        next(error);
    }
};