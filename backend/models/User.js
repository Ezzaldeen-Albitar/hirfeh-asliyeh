import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema, model } = mongoose;

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [60, 'Name must not exceed 60 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            minlength: [8, 'Password must be at least 8 characters'],
            select: false, 
        },
        googleId: {
            type: String,
            sparse: true, 
        },
        role: {
            type: String,
            enum: ['customer', 'artisan', 'admin'],
            default: 'customer',
        },
        avatar: String, 
        phone: String,
        address: {
            city: String,
            governorate: String,
            country: { type: String, default: 'Jordan' },
        },
        wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
        isEmailVerified: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        isBanned: { type: Boolean, default: false },
        bannedReason: String,
        emailOtp: {
            code: String,
            expiresAt: Date,
            attempts: { type: Number, default: 0 }, // max 5
            lastSentAt: Date,
        },
        passwordResetOtp: {
            code: String,
            expiresAt: Date,
            attempts: { type: Number, default: 0 },
            lastSentAt: Date,
            isUsed: { type: Boolean, default: false },
        },
    },
    { timestamps: true }
);

userSchema.index({ googleId: 1 }, { sparse: true });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
};
export default model('User', userSchema);