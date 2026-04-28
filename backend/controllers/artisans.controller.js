import ArtisanProfile from '../models/ArtisanProfile.js';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';

export const getAllArtisans = async (req, res, next) => {
    try {
        const { region, specialty, verified } = req.query;
        const filter = {};
        if (region) filter.region = region;
        if (specialty) filter.specialties = { $in: [specialty] };
        if (verified) filter.isVerified = verified === 'true';
        const artisans = await ArtisanProfile.find(filter)
            .populate('user', 'name profileImage')
            .sort('-createdAt');
        res.status(200).json({
            status: 'success',
            results: artisans.length,
            data: artisans
        });
    } catch (error) {
        next(error);
    }
};

export const getArtisanById = async (req, res, next) => {
    try {
        const artisan = await ArtisanProfile.findById(req.params.id)
            .populate('user', 'name email profileImage')
            .populate('products');
        if (!artisan) {
            return next(new AppError('No artisan found with that ID', 404));
        }
        res.status(200).json({
            status: 'success',
            data: artisan
        });
    } catch (error) {
        next(error);
    }
};

export const applyToBeArtisan = async (req, res, next) => {
    try {
        const existingProfile = await ArtisanProfile.findOne({ user: req.user._id });
        if (existingProfile) {
            return next(new AppError('You have already applied or have an artisan profile', 400));
        }
        const newProfile = await ArtisanProfile.create({
            user: req.user._id,
            ...req.body,
            isVerified: false
        });
        res.status(201).json({
            status: 'success',
            data: newProfile
        });
    } catch (error) {
        next(error);
    }
};

export const updateArtisanProfile = async (req, res, next) => {
    try {
        const artisan = await ArtisanProfile.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!artisan) {
            return next(new AppError('Profile not found or unauthorized', 404));
        }
        res.status(200).json({
            status: 'success',
            data: artisan
        });
    } catch (error) {
        next(error);
    }
};

export const getArtisanStats = async (req, res, next) => {
    try {
        const artisan = await ArtisanProfile.findOne({ user: req.user._id });
        if (!artisan) {
            return next(new AppError('Artisan profile not found', 404));
        }
        const stats = {
            totalViews: artisan.views || 0,
            totalSales: 0, 
            rating: artisan.averageRating || 0
        };
        res.status(200).json({
            status: 'success',
            data: stats
        });
    } catch (error) {
        next(error);
    }
};
export const verifyArtisan = async (req, res, next) => {
    try {
        const artisan = await ArtisanProfile.findByIdAndUpdate(
            req.params.id,
            { isVerified: true },
            { new: true }
        );
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
export const addBadgeToArtisan = async (req, res, next) => {
    try {
        const { badge } = req.body;
        const artisan = await ArtisanProfile.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { badges: badge } },
            { new: true }
        );
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