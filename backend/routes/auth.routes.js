import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';
import { verifyToken } from '../middleware/auth.middleware.js';
import * as authController from '../controllers/auth.controller.js';

const router = Router();
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  message: { message: 'Too many OTP requests. Please wait 10 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});
router.post(
  '/register',
  [
    body('name').trim().notEmpty().isLength({ min: 2, max: 60 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
  ],
  authController.register
);
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  authController.login
);
router.post('/logout', verifyToken, authController.logout);
router.get('/me', verifyToken, authController.getMe);
router.post(
  '/verify-otp',
  otpLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('otp').isLength({ min: 6, max: 6 }).isNumeric(),
  ],
  authController.verifyOTPHandler
);
router.post('/resend-otp', otpLimiter, [body('email').isEmail()], authController.resendOTP);
router.post('/forgot-password', otpLimiter, [body('email').isEmail()], authController.forgotPassword);
router.post(
  '/reset-password',
  [
    body('email').isEmail(),
    body('newPassword').isLength({ min: 8 }),
  ],
  authController.resetPassword
);
router.post('/google', authController.googleAuth);

export default router;
