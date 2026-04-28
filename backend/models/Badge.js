import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema({
    nameAr: {
        type: String,
        required: true
    },
    nameEn: {
        type: String,
        required: true
    },
    icon: {
        type: String
    },
    description: {
        type: String
    },
    criteria: {
        type: String
    },
    badgeType: {
        type: String,
        enum: ["verification", "milestone", "achievement", "special"]
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const Badge = mongoose.model('Badge', badgeSchema);
export default Badge;