export function errorHandler(err, req, res, next) {
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', err);
    }
    if (err.type === 'StripeAuthenticationError' || /Invalid API Key/i.test(err.message || '')) {
        return res.status(500).json({
            message: 'إعدادات Stripe غير صحيحة. تحقق من مفاتيح API.',
        });
    }
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            message: 'خطأ في التحقق من البيانات',
            errors: messages,
        });
    }
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(409).json({
            message: `${field} already exists`,
        });
    }
    if (err.name === 'CastError') {
        return res.status(400).json({
            message: `Invalid ${err.path}: ${err.value}`,
        });
    }
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'رمز الدخول غير صالح.' });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.' });
    }
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
}
export function createError(statusCode, message) {
    const err = new Error(message);
    err.statusCode = statusCode;
    return err;
}
