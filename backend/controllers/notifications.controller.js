import Notification from '../models/Notification.js';
import { AppError } from '../utils/AppError.js';

export const getMyNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .sort('-createdAt')
            .limit(50);
        res.status(200).json({
            status: 'success',
            results: notifications.length,
            data: notifications
        });
    } catch (error) {
        next(error);
    }
};

export const markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user.id },
            { isRead: true },
            { new: true }
        );
        if (!notification) {
            return next(new AppError('Notification not found', 404));
        }
        res.status(200).json({
            status: 'success',
            data: notification
        });
    } catch (error) {
        next(error);
    }
};

export const markAllAsRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.id, isRead: false },
            { isRead: true }
        );
        res.status(200).json({
            status: 'success',
            message: 'All notifications marked as read'
        });
    } catch (error) {
        next(error);
    }
};

export const deleteNotification = async (req, res, next) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            recipient: req.user.id
        });
        if (!notification) {
            return next(new AppError('Notification not found', 404));
        }
        res.status(200).json({
            status: 'success',
            message: 'Notification deleted'
        });
    } catch (error) {
        next(error);
    }
};

export const clearAllNotifications = async (req, res, next) => {
    try {
        await Notification.deleteMany({ recipient: req.user.id });
        res.status(200).json({
            status: 'success',
            message: 'All notifications cleared'
        });
    } catch (error) {
        next(error);
    }
};