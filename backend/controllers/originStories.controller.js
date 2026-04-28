import OriginStory from '../models/OriginStory.js';
import Product from '../models/Product.js';
import { AppError } from '../utils/AppError.js';

export const createOriginStory = async (req, res, next) => {
    try {
        const { title, content, region, media, product } = req.body;
        const newStory = await OriginStory.create({
            title,
            content,
            region,
            media,
            product,
            artisan: req.user.id
        });
        if (product) {
            await Product.findByIdAndUpdate(product, { originStory: newStory._id });
        }
        res.status(201).json({
            status: 'success',
            data: newStory
        });
    } catch (error) {
        next(error);
    }
};

export const getAllStories = async (req, res, next) => {
    try {
        const { region } = req.query;
        const filter = region ? { region } : {};
        const stories = await OriginStory.find(filter)
            .populate('artisan', 'name profileImage')
            .populate('product', 'title');
        res.status(200).json({
            status: 'success',
            results: stories.length,
            data: stories
        });
    } catch (error) {
        next(error);
    }
};

export const getStoryById = async (req, res, next) => {
    try {
        const story = await OriginStory.findById(req.params.id)
            .populate('artisan', 'name bio profileImage')
            .populate('product');
        if (!story) return next(new AppError('Story not found', 404));
        res.status(200).json({
            status: 'success',
            data: story
        });
    } catch (error) {
        next(error);
    }
};

export const updateStory = async (req, res, next) => {
    try {
        const story = await OriginStory.findOneAndUpdate(
            { _id: req.params.id, artisan: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!story) return next(new AppError('Story not found or unauthorized', 404));
        res.status(200).json({
            status: 'success',
            data: story
        });
    } catch (error) {
        next(error);
    }
};

export const deleteStory = async (req, res, next) => {
    try {
        const story = await OriginStory.findOneAndDelete({
            _id: req.params.id,
            artisan: req.user.id
        });
        if (!story) return next(new AppError('Story not found or unauthorized', 404));
        if (story.product) {
            await Product.findByIdAndUpdate(story.product, { $unset: { originStory: "" } });
        }
        res.status(200).json({
            status: 'success',
            message: 'Story deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};