import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minlength: 2,
        maxlength: 60
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String
    },
    googleId: {
        type: String,
        default: null
    },
    role: {
        type: String,
        enum: ["customer", "artisan", "admin"],
        default: "customer"
    },
    avatar: {
        type: String
    },
    phone: {
        type: String
    },
    address: {
        city: String,
        governorate: String,
        country: { type: String, default: "Jordan" }
    },
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isBanned: {
        type: Boolean,
        default: false
    },
    bannedReason: {
        type: String
    },
    emailOtp: {
        code: String,
        expiresAt: Date,
        attempts: { type: Number, default: 0 },
        lastSentAt: Date
    },
    passwordResetOtp: {
        code: String,
        expiresAt: Date,
        attempts: { type: Number, default: 0 },
        lastSentAt: Date,
        isUsed: { type: Boolean, default: false }
    }
}, { timestamps: true });

userSchema.pre("save", async function (next) {
    if (!this.isModified("password") || !this.password) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(process.env.SALT);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;