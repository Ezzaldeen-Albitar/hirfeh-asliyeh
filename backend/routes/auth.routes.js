import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import { verifyToken } from '../middleware/auth.middleware.js';
import * as authController from '../controllers/auth.controller.js';

const router = Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
};

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 15, // ✅ Increased from 3 to 15 attempts
  message: { message: 'طلبات كثيرة لرمز التحقق. يرجى الانتظار 10 دقائق.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development', // Skip in dev
});

router.post(
  '/register',
  [
    body('name').trim().notEmpty().isLength({ min: 2, max: 60 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
  ],
  validate,
  authController.register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  validate,
  authController.login
);

router.post('/logout', authController.logout);
router.get('/me', verifyToken, authController.getMe);

router.post(
  '/verify-otp',
  otpLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('otp').isLength({ min: 6, max: 6 }).isNumeric(),
  ],
  validate,
  authController.verifyOTPHandler
);

router.post('/resend-otp', otpLimiter, [body('email').isEmail()], validate, authController.resendOTP);
router.post('/forgot-password', otpLimiter, [body('email').isEmail()], validate, authController.forgotPassword);

router.post(
  '/reset-password',
  [
    body('email').isEmail(),
    body('newPassword').isLength({ min: 8 }),
  ],
  validate,
  authController.resetPassword
);

router.post('/google', authController.googleAuth);

export default router;
