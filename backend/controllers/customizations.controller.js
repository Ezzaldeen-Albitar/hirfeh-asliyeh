import Customization from '../models/Customization.js';
import Order from '../models/Order.js';
import { AppError } from '../utils/AppError.js';

export const createCustomizationRequest = async (req, res, next) => {
    try {
        const newRequest = await Customization.create({
            customer: req.user.id,
            artisan: req.body.artisan,
            product: req.body.product,
            description: req.body.description,
            attachments: req.body.attachments,
            status: 'pending'
        });
        res.status(201).json({
            status: 'success',
            data: newRequest
        });
    } catch (error) {
        next(error);
    }
};

export const getCustomizations = async (req, res, next) => {
    try {
        const filter = req.user.role === 'artisan'
            ? { artisan: req.user.id }
            : { customer: req.user.id };
        const requests = await Customization.find(filter)
            .populate('customer', 'name profileImage')
            .populate('artisan', 'name profileImage')
            .populate('product', 'title price');
        res.status(200).json({
            status: 'success',
            results: requests.length,
            data: requests
        });
    } catch (error) {
        next(error);
    }
};

export const getCustomizationById = async (req, res, next) => {
    try {
        const request = await Customization.findById(req.params.id)
            .populate('customer', 'name email')
            .populate('artisan', 'name email')
            .populate('messages.sender', 'name profileImage');
        if (!request) return next(new AppError('Request not found', 404));
        res.status(200).json({
            status: 'success',
            data: request
        });
    } catch (error) {
        next(error);
    }
};

export const sendQuote = async (req, res, next) => {
    try {
        const { price, estimatedDays } = req.body;
        const request = await Customization.findOneAndUpdate(
            { _id: req.params.id, artisan: req.user.id },
            {
                artisanQuote: price,
                estimatedDays,
                status: 'quoted'
            },
            { new: true, runValidators: true }
        );
        if (!request) return next(new AppError('Request not found or unauthorized', 404));
        res.status(200).json({
            status: 'success',
            data: request
        });
    } catch (error) {
        next(error);
    }
};

export const acceptQuote = async (req, res, next) => {
    try {
        const request = await Customization.findOne({
            _id: req.params.id,
            customer: req.user.id,
            status: 'quoted'
        });
        if (!request) return next(new AppError('No quoted request found', 404));
        request.status = 'accepted';
        await request.save();
        const newOrder = await Order.create({
            customer: request.customer,
            artisan: request.artisan,
            items: [{
                product: request.product,
                price: request.artisanQuote,
                quantity: 1,
                isCustom: true
            }],
            totalPrice: request.artisanQuote,
            customizationRef: request._id
        });
        res.status(201).json({
            status: 'success',
            order: newOrder
        });
    } catch (error) {
        next(error);
    }
};

export const addMessage = async (req, res, next) => {
    try {
        const { text } = req.body;
        const request = await Customization.findById(req.params.id);
        if (!request) return next(new AppError('Request not found', 404));
        request.messages.push({
            sender: req.user.id,
            text
        });
        await request.save();
        res.status(200).json({
            status: 'success',
            data: request.messages
        });
    } catch (error) {
        next(error);
    }
};

export const completeCustomization = async (req, res, next) => {
    try {
        const request = await Customization.findOneAndUpdate(
            { _id: req.params.id, artisan: req.user.id },
            { status: 'completed' },
            { new: true }
        );
        if (!request) return next(new AppError('Request not found or unauthorized', 404));
        res.status(200).json({
            status: 'success',
            data: request
        });
    } catch (error) {
        next(error);
    }
};