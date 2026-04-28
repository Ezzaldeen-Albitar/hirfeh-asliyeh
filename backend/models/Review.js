import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    artisan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ArtisanProfile',
        required: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    title: String,
    body: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 1000
    },
    images: [String],
    subRatings: {
        quality: Number,
        accuracy: Number,
        shipping: Number,
        communication: Number
    },
    isVerifiedPurchase: {
        type: Boolean,
        default: true
    },
    artisanReply: {
        content: String,
        repliedAt: Date
    },
    isVisible: {
        type: Boolean,
        default: true
    },
    helpfulVotes: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

reviewSchema.index({ reviewer: 1, product: 1, order: 1 }, { unique: true });
reviewSchema.index({ product: 1, createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);
export default Review;