import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const messageSchema = new Schema(
    {
        sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String, required: true, maxlength: 2000 },
        sentAt: { type: Date, default: Date.now },
        isRead: { type: Boolean, default: false },
    },
    { _id: true }
);
const customizationRequestSchema = new Schema(
    {
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
        customer: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        requestedOptions: {
            color: String,
            size: String,
            engraving: String,
            quantity: { type: Number, default: 1, min: 1 },
        },
        customerNotes: {
            type: String,
            maxlength: [1000, 'Notes must not exceed 1000 characters'],
        },
        referenceImages: [String],
        basePrice: Number,
        customizationFee: Number,
        totalPrice: Number,
        status: {
            type: String,
            enum: ['pending', 'quoted', 'accepted', 'in-progress', 'completed', 'cancelled'],
            default: 'pending',
        },
        artisanQuote: {
            price: Number,
            leadTimeDays: Number,
            message: String,
            sentAt: Date,
        },
        messages: [messageSchema],
        convertedToOrder: { type: Schema.Types.ObjectId, ref: 'Order' },
    },
    { timestamps: true }
);

const VALID_TRANSITIONS = {
    pending: ['quoted', 'cancelled'],
    quoted: ['accepted', 'cancelled'],
    accepted: ['in-progress', 'cancelled'],
    'in-progress': ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
};
customizationRequestSchema.methods.canTransitionTo = function (newStatus) {
    return VALID_TRANSITIONS[this.status]?.includes(newStatus) ?? false;
};
customizationRequestSchema.index({ customer: 1, createdAt: -1 });
customizationRequestSchema.index({ artisan: 1, status: 1 });
export default model('CustomizationRequest', customizationRequestSchema);