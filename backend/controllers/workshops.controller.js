import Workshop from '../models/Workshop.js';
import { AppError } from '../utils/AppError.js';

export const createWorkshop = async (req, res, next) => {
    try {
        const workshop = await Workshop.create({
            ...req.body,
            artisan: req.user.id
        });
        res.status(201).json({
            status: 'success',
            data: workshop
        });
    } catch (error) {
        next(error);
    }
};

export const getAllWorkshops = async (req, res, next) => {
    try {
        const { category, type, region } = req.query;
        const filter = { isActive: true };
        if (category) filter.category = category;
        if (type) filter.type = type; // online or onsite
        if (region) filter.region = region;
        const workshops = await Workshop.find(filter)
            .populate('artisan', 'name profileImage')
            .sort('startDate');
        res.status(200).json({
            status: 'success',
            results: workshops.length,
            data: workshops
        });
    } catch (error) {
        next(error);
    }
};

export const getWorkshopById = async (req, res, next) => {
    try {
        const workshop = await Workshop.findById(req.params.id)
            .populate('artisan', 'name bio profileImage')
            .populate('attendees', 'name profileImage');
        if (!workshop) return next(new AppError('Workshop not found', 404));
        res.status(200).json({
            status: 'success',
            data: workshop
        });
    } catch (error) {
        next(error);
    }
};

export const updateWorkshop = async (req, res, next) => {
    try {
        const workshop = await Workshop.findOneAndUpdate(
            { _id: req.params.id, artisan: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!workshop) return next(new AppError('Workshop not found or unauthorized', 404));

        res.status(200).json({
            status: 'success',
            data: workshop
        });
    } catch (error) {
        next(error);
    }
};

export const joinWorkshop = async (req, res, next) => {
    try {
        const workshop = await Workshop.findById(req.params.id);
        if (!workshop) return next(new AppError('Workshop not found', 404));
        if (workshop.attendees.includes(req.user.id)) {
            return next(new AppError('You are already registered for this workshop', 400));
        }
        if (workshop.attendees.length >= workshop.maxAttendees) {
            return next(new AppError('Workshop is full', 400));
        }
        workshop.attendees.push(req.user.id);
        await workshop.save();
        res.status(200).json({
            status: 'success',
            message: 'Successfully joined the workshop'
        });
    } catch (error) {
        next(error);
    }
};

export const cancelAttendance = async (req, res, next) => {
    try {
        const workshop = await Workshop.findByIdAndUpdate(
            req.params.id,
            { $pull: { attendees: req.user.id } },
            { new: true }
        );
        if (!workshop) return next(new AppError('Workshop not found', 404));
        res.status(200).json({
            status: 'success',
            message: 'Attendance cancelled'
        });
    } catch (error) {
        next(error);
    }
};

export const deleteWorkshop = async (req, res, next) => {
    try {
        const workshop = await Workshop.findOneAndDelete({
            _id: req.params.id,
            artisan: req.user.id
        });
        if (!workshop) return next(new AppError('Workshop not found or unauthorized', 404));
        res.status(200).json({
            status: 'success',
            message: 'Workshop deleted'
        });
    } catch (error) {
        next(error);
    }
};