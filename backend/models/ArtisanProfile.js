import mongoose from 'mongoose';

const artisanProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    craftName: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        required: true,
        maxlength: 1000
    },
    region: {
        type: String,
        required: true,
        enum: [
            "Amman",
            "Irbid",
            "Karak",
            "Madaba",
            "Aqaba",
            "Zarqa",
            "Salt",
            "Jarash",
            "Ajloun",
            "Ma'an",
            "Tafila",
            "  "
        ]
    },
    specialties: [String],
    profileImage: String,
    coverImage: String,
    socialLinks: {
        instagram: String,
        facebook: String,
        whatsapp: String
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verifiedAt: Date,
    verificationDocs: [String],
    badges: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Badge'
    }],
    acceptsCustomOrders: {
        type: Boolean,
        default: true
    },
    acceptsWorkshops: {
        type: Boolean,
        default: false
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    totalSales: {
        type: Number,
        default: 0
    },
    totalRevenue: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

artisanProfileSchema.index({ region: 1, isVerified: 1 });
artisanProfileSchema.index({ rating: -1 });

const ArtisanProfile = mongoose.model('ArtisanProfile', artisanProfileSchema);
export default ArtisanProfile;