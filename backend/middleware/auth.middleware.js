import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function verifyToken(req, res, next) {
  try {
    let token = null;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      token = req.cookies?.token;
    }
    if (!token) {
      return res.status(401).json({ message: 'يرجى تسجيل الدخول.' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'المستخدم غير موجود أو غير نشط.' });
    }
    if (user.isBanned) {
      return res.status(403).json({ message: 'الحساب محظور.' });
    }
    req.user = { userId: user._id.toString(), role: user.role, email: user.email };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'رمز الدخول غير صالح أو منتهي.' });
  }
}

export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'غير مصرح.' });
  }
  next();
};
