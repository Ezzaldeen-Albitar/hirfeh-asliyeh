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
import {
  getDefaultArtisanAvatarImage,
  getDefaultArtisanCoverImage,
  normalizeCraftSpecialty,
  normalizeRegion,
} from '../utils/artisanProfileDefaults.js';

const canExposeDevOtp = process.env.NODE_ENV !== 'production';

function parseGoogleClientIds() {
  return [
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_IDS,
  ]
    .filter(Boolean)
    .flatMap((value) => value.split(','))
    .map((value) => value.trim())
    .filter(Boolean);
}

async function buildAuthUserPayload(user) {
  const payload = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar || (user.role === 'artisan' ? getDefaultArtisanAvatarImage() : user.avatar),
    isEmailVerified: user.isEmailVerified,
  };

  if (user.role !== 'artisan') {
    return payload;
  }

  const artisanProfile = await ArtisanProfile.findOne({ user: user._id }).lean();
  const pendingCraft = normalizeCraftSpecialty(user.pendingArtisanProfile?.craftSpecialty);

  if (artisanProfile) {
    payload.craftSpecialty = artisanProfile.craftName || artisanProfile.specialties?.[0] || pendingCraft || '';
    payload.governorate = artisanProfile.region || normalizeRegion(user.address?.governorate || '');
    payload.coverImage = artisanProfile.coverImage || getDefaultArtisanCoverImage(payload.craftSpecialty);
    payload.avatar = user.avatar || artisanProfile.profileImage || getDefaultArtisanAvatarImage();
    payload.artisanProfileId = artisanProfile._id;
    return payload;
  }

  if (pendingCraft) {
    payload.craftSpecialty = pendingCraft;
    payload.governorate = normalizeRegion(
      user.pendingArtisanProfile?.governorate || user.address?.governorate || ''
    );
    payload.coverImage = getDefaultArtisanCoverImage(pendingCraft);
    payload.avatar = user.avatar || getDefaultArtisanAvatarImage();
  }

  return payload;
}

async function ensureArtisanProfileForVerifiedUser(user) {
  if (user.role !== 'artisan') {
    return null;
  }

  const existingProfile = await ArtisanProfile.findOne({ user: user._id });
  if (existingProfile) {
    return existingProfile;
  }

  const craftSpecialty = normalizeCraftSpecialty(user.pendingArtisanProfile?.craftSpecialty);
  const region = normalizeRegion(
    user.pendingArtisanProfile?.governorate || user.address?.governorate || ''
  );
  const bio = typeof user.pendingArtisanProfile?.bio === 'string'
    ? user.pendingArtisanProfile.bio.trim()
    : '';

  if (!craftSpecialty || !region || !bio) {
    return null;
  }

  const artisanProfile = await ArtisanProfile.create({
    user: user._id,
    craftName: craftSpecialty,
    bio,
    region,
    specialties: [craftSpecialty],
    profileImage: user.avatar || getDefaultArtisanAvatarImage(),
    coverImage: getDefaultArtisanCoverImage(craftSpecialty),
    isVerified: false,
  });

  if (!user.avatar) {
    user.avatar = getDefaultArtisanAvatarImage();
  }
  user.pendingArtisanProfile = undefined;
  await user.save();

  return artisanProfile;
}

async function deliverOtpEmail({ email, name, otp, purpose = 'verify' }) {
  try {
    if (purpose === 'reset') {
      await sendPasswordResetEmail(email, name, otp);
    } else {
      await sendOTPEmail(email, name, otp);
    }
    return { delivered: true };
  } catch (mailErr) {
    console.error('Mail send failed:', mailErr.message);
    
    return {
      delivered: false,
      ...(canExposeDevOtp ? { devOtp: otp } : {}),
      message: canExposeDevOtp
        ? 'Email delivery failed. Please check your connection or use the development code if available.'
        : 'Email delivery failed. Please try again later.',
    };
  }
}

export async function register(req, res, next) {
  try {
    const { name, email, password, role, craftSpecialty, governorate, bio } = req.body;
    const safeRole = ['customer', 'artisan'].includes(role) ? role : 'customer';
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'البريد الإلكتروني مسجل مسبقاً. يرجى تسجيل الدخول.' });
    }
    const otp = generateOTP();
    const user = await User.create({
      name,
      email,
      password,
      role: safeRole,
      ...(safeRole === 'artisan' ? { avatar: getDefaultArtisanAvatarImage() } : {}),
      ...(safeRole === 'artisan' && governorate
        ? { address: { governorate: normalizeRegion(governorate) } }
        : {}),
      ...(safeRole === 'artisan'
        ? {
            pendingArtisanProfile: {
              craftSpecialty: normalizeCraftSpecialty(craftSpecialty),
              governorate: normalizeRegion(governorate),
              bio: typeof bio === 'string' ? bio.trim() : '',
            },
          }
        : {}),
      emailOtp: buildOTPDoc(otp),
    });
    const delivery = await deliverOtpEmail({ email, name, otp });
    
    return res.status(201).json({
      message: delivery.delivered
        ? 'Account created. Please check your email for the verification code.'
        : 'Account created but we could not send the email. Please use the resend button in a moment.',
      email: user.email,
      ...(delivery.devOtp ? { devOtp: delivery.devOtp } : {}), // For easier debugging/emergency access
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
      return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' });
    }
    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: 'يرجى توثيق بريدك الإلكتروني أولاً.',
        requiresVerification: true,
        email: user.email,
      });
    }
    if (user.isBanned) {
      return res.status(403).json({
        message: `Account banned: ${user.bannedReason || 'Contact support for details.'}`,
      });
    }
    const token = signTokenAndSetCookie(res, {
      userId: user._id,
      role: user.role,
      email: user.email,
    });
    const authUser = await buildAuthUserPayload(user);
    return res.json({
      message: 'تم تسجيل الدخول بنجاح.',
      user: authUser,
      token,
    });
  } catch (err) {
    next(err);
  }
}
export async function logout(req, res) {
  clearAuthCookie(res);
  return res.json({ message: 'تم تسجيل الخروج بنجاح.' });
}

export async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user.userId).populate('wishlist', 'title images price');
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود.' });
    }
    let artisanProfile = null;
    if (user.role === 'artisan') {
      artisanProfile = await ArtisanProfile.findOne({ user: user._id })
        .populate('badges')
        .lean();
      if (artisanProfile) {
        const craftSpecialty = artisanProfile.craftName || artisanProfile.specialties?.[0] || '';
        artisanProfile.profileImage = artisanProfile.profileImage || user.avatar || getDefaultArtisanAvatarImage();
        artisanProfile.coverImage = artisanProfile.coverImage || getDefaultArtisanCoverImage(craftSpecialty);
        if (!user.avatar) {
          user.avatar = artisanProfile.profileImage;
          await user.save();
        }
      } else if (!user.avatar) {
        user.avatar = getDefaultArtisanAvatarImage();
        await user.save();
      }
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
      return res.status(404).json({ message: 'المستخدم غير موجود.' });
    }
    const otpDoc = purpose === 'reset' ? user.passwordResetOtp : user.emailOtp;
    if (!otpDoc?.code) {
      return res.status(400).json({ message: 'لا يوجد رمز تحقق. يرجى طلب رمز جديد.' });
    }
    if (isOTPExpired(otpDoc.expiresAt)) {
      return res.status(400).json({ message: 'انتهت صلاحية الرمز. يرجى طلب رمز جديد.' });
    }
    if (otpDoc.attempts >= OTP_MAX_ATTEMPTS) {
      return res.status(429).json({
        message: 'محاولات خاطئة كثيرة. يرجى طلب رمز جديد.',
      });
    }
    const isValid = verifyOTP(otp, otpDoc.code);
    if (!isValid) {
      const field = purpose === 'reset' ? 'passwordResetOtp.attempts' : 'emailOtp.attempts';
      await User.findByIdAndUpdate(user._id, { $inc: { [field]: 1 } });
      const remaining = OTP_MAX_ATTEMPTS - (otpDoc.attempts + 1);
      return res.status(400).json({
        message: 'رمز التحقق غير صحيح.',
        remainingAttempts: Math.max(0, remaining),
      });
    }
    if (purpose === 'verify') {
      user.isEmailVerified = true;
      user.emailOtp = undefined;
      await user.save();
      await ensureArtisanProfileForVerifiedUser(user);
      const token = signTokenAndSetCookie(res, {
        userId: user._id,
        role: user.role,
        email: user.email,
      });
      const authUser = await buildAuthUserPayload(user);
      return res.json({
        message: 'تم توثيق البريد الإلكتروني بنجاح.',
        user: authUser,
        token,
      });
    }
    if (purpose === 'reset') {
      user.passwordResetOtp.isUsed = true;
      user.passwordResetOtp.code = undefined; 
      await user.save();
      return res.json({ message: 'تم التحقق من الرمز. يمكنك الآن إعادة تعيين كلمة المرور.', email });
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
      return res.json({ message: 'إذا كان البريد موجوداً، تم إرسال رمز جديد.' });
    }
    const otpDoc = purpose === 'reset' ? user.passwordResetOtp : user.emailOtp;
    if (!canResendOTP(otpDoc?.lastSentAt)) {
      const seconds = resendCooldownSeconds(otpDoc?.lastSentAt);
      return res.status(429).json({
        message: 'يرجى الانتظار قبل طلب رمز جديد.',
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
    const delivery = await deliverOtpEmail({ email, name: user.name, otp, purpose });
    return res.json({
      message: delivery.delivered ? 'New verification code sent.' : 'Code regenerated but email failed to send.',
      ...(delivery.devOtp ? { devOtp: delivery.devOtp } : {}),
    });
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
        return res.json({ message: 'إذا كان البريد موجوداً، تم إرسال رمز إعادة التعيين.' });
      }
      const otp = generateOTP();
      user.passwordResetOtp = { ...buildOTPDoc(otp), isUsed: false };
      await user.save();
      await deliverOtpEmail({ email, name: user.name, otp, purpose: 'reset' });
    }
    return res.json({ message: 'إذا كان البريد موجوداً، تم إرسال رمز إعادة التعيين.' });
  } catch (err) {
    next(err);
  }
}
export async function resetPassword(req, res, next) {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود.' });
    }
    if (!user.passwordResetOtp?.isUsed) {
      return res.status(400).json({
        message: 'يرجى التحقق من رمز إعادة التعيين أولاً.',
      });
    }
    user.password = newPassword;
    user.passwordResetOtp = undefined;
    await user.save();
    return res.json({ message: 'تم تغيير كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.' });
  } catch (err) {
    next(err);
  }
}
export async function googleAuth(req, res, next) {
  try {
    const { idToken } = req.body;
    const googleClientIds = parseGoogleClientIds();
    if (!idToken) {
      return res.status(400).json({ message: 'رمز Google مطلوب.' });
    }
    if (!googleClientIds.length) {
      return res.status(500).json({ message: 'تسجيل الدخول عبر Google غير مهيأ بعد.' });
    }

    const googleRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
    );
    if (!googleRes.ok) {
      return res.status(401).json({ message: 'رمز Google غير صالح.' });
    }
    const payload = await googleRes.json();

    const validAudiences = googleClientIds;
    if (validAudiences.length && !validAudiences.includes(payload.aud)) {
      if (process.env.NODE_ENV !== 'production') {
        const mask = (value) => (value && value.length > 20 ? `${value.slice(0, 8)}...${value.slice(-12)}` : value);
        console.warn('[Google Auth] audience mismatch', {
          receivedAud: mask(payload.aud),
          allowedAudiences: validAudiences.map(mask),
        });
      }
      return res.status(401).json({ message: 'رمز Google لا يطابق هذا التطبيق.' });
    }

    const { email, name, sub: googleId, picture: avatar } = payload;
    if (!email || !googleId) {
      return res.status(400).json({ message: 'بيانات Google غير صالحة.' });
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
      return res.status(403).json({ message: 'الحساب محظور.' });
    }
    const token = signTokenAndSetCookie(res, {
      userId: user._id,
      role: user.role,
      email: user.email,
    });
    return res.json({
      message: 'تم تسجيل الدخول عبر Google.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
}
