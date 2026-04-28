import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    };
    res.cookie('token', token, cookieOptions);
    user.password = undefined;
    user.otp = undefined;
    res.status(statusCode).json({
        status: 'success',
        token,
        data: { user },
    });
};

export const register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new AppError('Email already in use', 400));
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
        const newUser = await User.create({
            name,
            email,
            password,
            role,
            otp: otpHash,
            otpExpires: Date.now() + 10 * 60 * 1000,
        });
        res.status(201).json({
            status: 'success',
            message: 'OTP sent to email',
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new AppError('Please provide email and password', 400));
        }
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return next(new AppError('Incorrect email or password', 401));
        }
        if (!user.isVerified) {
            return next(new AppError('Please verify your account first', 401));
        }
        if (user.isBanned) {
            return next(new AppError('Your account has been banned', 403));
        }
        createSendToken(user, 200, res);
    } catch (error) {
        next(error);
    }
};

export const logout = (req, res) => {
    res.cookie('token', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(200).json({ status: 'success' });
};

export const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password -otp -otpExpires');
        res.status(200).json({
            status: 'success',
            data: { user },
        });
    } catch (error) {
        next(error);
    }
};

export const verifyOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
        const user = await User.findOne({
            email,
            otp: hashedOtp,
            otpExpires: { $gt: Date.now() },
        });
        if (!user) {
            return next(new AppError('Invalid or expired OTP', 400));
        }
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
        createSendToken(user, 200, res);
    } catch (error) {
        next(error);
    }
};

export const resendOtp = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return next(new AppError('User not found', 404));
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = crypto.createHash('sha256').update(otp).digest('hex');
        user.otpExpires = Date.now() + 10 * 60 * 1000;
        await user.save();
        res.status(200).json({ status: 'success', message: 'New OTP sent' });
    } catch (error) {
        next(error);
    }
};

export const forgotPassword = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (user) {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            user.otp = crypto.createHash('sha256').update(otp).digest('hex');
            user.otpExpires = Date.now() + 10 * 60 * 1000;
            await user.save();
        }
        res.status(200).json({
            status: 'success',
            message: 'If user exists, an OTP has been sent',
        });
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;
        const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
        const user = await User.findOne({
            email,
            otp: hashedOtp,
            otpExpires: { $gt: Date.now() },
        });
        if (!user) return next(new AppError('Invalid or expired OTP', 400));
        user.password = newPassword;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
        createSendToken(user, 200, res);
    } catch (error) {
        next(error);
    }
};