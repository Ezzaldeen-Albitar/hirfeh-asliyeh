import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const reviewSchema = new Schema(
    {
        reviewer: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        artisan: {
            type: Schema.Types.ObjectId,
            ref: 'ArtisanProfile',
            required: true,
        },
        order: {
            type: Schema.Types.ObjectId,
            ref: 'Order',
            required: true,
        },
        rating: {
            type: Number,
            required: [true, 'Rating is required'],
            min: [1, 'Rating must be at least 1'],
            max: [5, 'Rating must not exceed 5'],
        },
        title: String,
        body: {
            type: String,
            required: [true, 'Review body is required'],
            minlength: [10, 'Review must be at least 10 characters'],
            maxlength: [1000, 'Review must not exceed 1000 characters'],
        },
        images: {
            type: [String],
            validate: {
                validator: (v) => v.length <= 4,
                message: 'Maximum 4 images allowed',
            },
        },
        subRatings: {
            quality: { type: Number, min: 1, max: 5 },
            accuracy: { type: Number, min: 1, max: 5 },
            shipping: { type: Number, min: 1, max: 5 },
            communication: { type: Number, min: 1, max: 5 },
        },
        isVerifiedPurchase: { type: Boolean, default: true },
        artisanReply: {
            content: String,
            repliedAt: Date,
        },
        isVisible: { type: Boolean, default: true },
        helpfulVotes: { type: Number, default: 0 },
    },
    { timestamps: true }
);

reviewSchema.index({ reviewer: 1, product: 1, order: 1 }, { unique: true });
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ artisan: 1, createdAt: -1 });
export default model('Review', reviewSchema);