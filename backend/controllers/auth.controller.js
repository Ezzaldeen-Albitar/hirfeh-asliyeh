import User from '../models/User.js';
import ArtisanProfile from '../models/ArtisanProfile.js';
import {
  generateOTP,
  buildOTPDoc,
  verifyOTP,
  isOTPExpired,
  canResendOTP,
  resendCooldownSeconds,
  OTP_MAX_ATTEMPTS,
} from '../services/otp.service.js';
import { sendOTPEmail, sendPasswordResetEmail } from '../services/mailer.service.js';
import { signTokenAndSetCookie, clearAuthCookie } from '../utils/jwt.js';
export async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    const safeRole = ['customer', 'artisan'].includes(role) ? role : 'customer';
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered. Please log in.' });
    }
    const otp = generateOTP();
    const user = await User.create({
      name,
      email,
      password,
      role: safeRole,
      emailOtp: buildOTPDoc(otp),
    });
    try {
      await sendOTPEmail(email, name, otp);
    } catch (mailErr) {
      console.error('Mail send failed:', mailErr.message);
    }
    return res.status(201).json({
      message: 'Account created. Please check your email for the verification code.',
      email: user.email,
    });
  } catch (err) {
    next(err);
  }
}
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: 'Please verify your email first.',
        requiresVerification: true,
        email: user.email,
      });
    }
    if (user.isBanned) {
      return res.status(403).json({
        message: `Account banned: ${user.bannedReason || 'Contact support for details.'}`,
      });
    }
    signTokenAndSetCookie(res, {
      userId: user._id,
      role: user.role,
      email: user.email,
    });
    return res.json({
      message: 'Logged in successfully.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (err) {
    next(err);
  }
}
export async function logout(req, res) {
  clearAuthCookie(res);
  return res.json({ message: 'Logged out successfully.' });
}

export async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user.userId).populate('wishlist', 'title images price');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    let artisanProfile = null;
    if (user.role === 'artisan') {
      artisanProfile = await ArtisanProfile.findOne({ user: user._id })
        .populate('badges')
        .lean();
    }
    return res.json({ user, artisanProfile });
  } catch (err) {
    next(err);
  }
}

export async function verifyOTPHandler(req, res, next) {
  try {
    const { email, otp, purpose = 'verify' } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const otpDoc = purpose === 'reset' ? user.passwordResetOtp : user.emailOtp;
    if (!otpDoc?.code) {
      return res.status(400).json({ message: 'No verification code found. Please request a new one.' });
    }
    if (isOTPExpired(otpDoc.expiresAt)) {
      return res.status(400).json({ message: 'Code has expired. Please request a new one.' });
    }
    if (otpDoc.attempts >= OTP_MAX_ATTEMPTS) {
      return res.status(429).json({
        message: 'Too many wrong attempts. Please request a new code.',
      });
    }
    const isValid = verifyOTP(otp, otpDoc.code);
    if (!isValid) {
      const field = purpose === 'reset' ? 'passwordResetOtp.attempts' : 'emailOtp.attempts';
      await User.findByIdAndUpdate(user._id, { $inc: { [field]: 1 } });
      const remaining = OTP_MAX_ATTEMPTS - (otpDoc.attempts + 1);
      return res.status(400).json({
        message: 'Incorrect code.',
        remainingAttempts: Math.max(0, remaining),
      });
    }
    if (purpose === 'verify') {
      user.isEmailVerified = true;
      user.emailOtp = undefined;
      await user.save();
      signTokenAndSetCookie(res, {
        userId: user._id,
        role: user.role,
        email: user.email,
      });
      return res.json({
        message: 'Email verified successfully.',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }
    if (purpose === 'reset') {
      user.passwordResetOtp.isUsed = true;
      user.passwordResetOtp.code = undefined; 
      await user.save();
      return res.json({ message: 'Code verified. You can now reset your password.', email });
    }
  } catch (err) {
    next(err);
  }
}
export async function resendOTP(req, res, next) {
  try {
    const { email, purpose = 'verify' } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: 'If this email exists, a new code has been sent.' });
    }
    const otpDoc = purpose === 'reset' ? user.passwordResetOtp : user.emailOtp;
    if (!canResendOTP(otpDoc?.lastSentAt)) {
      const seconds = resendCooldownSeconds(otpDoc?.lastSentAt);
      return res.status(429).json({
        message: 'Please wait before requesting another code.',
        retryAfterSeconds: seconds,
      });
    }
    const otp = generateOTP();
    const newOtpDoc = buildOTPDoc(otp);
    if (purpose === 'reset') {
      user.passwordResetOtp = { ...newOtpDoc, isUsed: false };
    } else {
      user.emailOtp = newOtpDoc;
    }
    await user.save();
    try {
      if (purpose === 'reset') {
        await sendPasswordResetEmail(email, user.name, otp);
      } else {
        await sendOTPEmail(email, user.name, otp);
      }
    } catch (mailErr) {
      console.error('Mail send failed:', mailErr.message);
    }
    return res.json({ message: 'New verification code sent.' });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      if (!canResendOTP(user.passwordResetOtp?.lastSentAt)) {
        return res.json({ message: 'If this email exists, a reset code has been sent.' });
      }
      const otp = generateOTP();
      user.passwordResetOtp = { ...buildOTPDoc(otp), isUsed: false };
      await user.save();
      try {
        await sendPasswordResetEmail(email, user.name, otp);
      } catch (mailErr) {
        console.error('Mail send failed:', mailErr.message);
      }
    }
    return res.json({ message: 'If this email exists, a reset code has been sent.' });
  } catch (err) {
    next(err);
  }
}
export async function resetPassword(req, res, next) {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    if (!user.passwordResetOtp?.isUsed) {
      return res.status(400).json({
        message: 'Please verify your reset code first via /api/auth/verify-otp.',
      });
    }
    user.password = newPassword;
    user.passwordResetOtp = undefined;
    await user.save();
    return res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    next(err);
  }
}
export async function googleAuth(req, res, next) {
  try {
    const { idToken } = req.body;
    const { email, name, googleId, avatar } = req.body;
    if (!email || !googleId) {
      return res.status(400).json({ message: 'Invalid Google credentials.' });
    }
    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        avatar,
        isEmailVerified: true,
        role: 'customer',
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      if (!user.avatar && avatar) user.avatar = avatar;
      await user.save();
    }
    if (user.isBanned) {
      return res.status(403).json({ message: 'Account banned.' });
    }
    signTokenAndSetCookie(res, {
      userId: user._id,
      role: user.role,
      email: user.email,
    });
    return res.json({
      message: 'Logged in with Google.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    next(err);
  }
}
