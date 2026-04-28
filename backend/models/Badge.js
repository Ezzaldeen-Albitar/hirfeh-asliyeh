import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const badgeSchema = new Schema(
    {
        nameAr: { type: String, required: true },
        nameEn: { type: String, required: true }, 
        icon: String,
        description: String,
        criteria: String,
        badgeType: {
            type: String,
            enum: ['verification', 'milestone', 'achievement', 'special'],
        },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);
export default model('Badge', badgeSchema);