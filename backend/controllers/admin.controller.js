import User from '../models/User.js';
import Product from '../models/Product.js';
import ArtisanProfile from '../models/ArtisanProfile.js';
import { AppError } from '../utils/AppError.js'; 

export const verifyArtisan = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { badge } = req.body;

        const artisan = await ArtisanProfile.findByIdAndUpdate(
            id,
            {
                isVerified: true,
                $addToSet: { badges: badge } 
            },
            { new: true }
        ).populate('user', 'name email');
        if (!artisan) {
            return next(new AppError('Artisan profile not found', 404));
        }
        res.status(200).json({
            status: 'success',
            data: artisan
        });
    } catch (error) {
        next(error);
    }
};

export const toggleProductFeatured = async (req, res, next) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);
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

export const toggleUserStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) return next(new AppError('User not found', 404));
        if (user.role === 'admin') return next(new AppError('Cannot ban an admin', 403));
        user.isBanned = !user.isBanned;
        await user.save();
        res.status(200).json({
            status: 'success',
            isBanned: user.isBanned
        });
    } catch (error) {
        next(error);
    }
};

export const getDashboardStats = async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();
        const pendingArtisans = await ArtisanProfile.countDocuments({ isVerified: false });
        res.status(200).json({
            status: 'success',
            data: {
                totalUsers,
                totalProducts,
                pendingArtisans
            }
        });
    } catch (error) {
        next(error);
    }
};