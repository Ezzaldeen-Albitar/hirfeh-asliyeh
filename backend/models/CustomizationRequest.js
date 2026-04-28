import mongoose from 'mongoose';

const customizationRequestSchema = new mongoose.Schema({
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
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    requestedOptions: {
        color: String,
        size: String,
        engraving: String,
        quantity: {
            type: Number,
            default: 1,
            min: 1
        }
    },
    customerNotes: {
        type: String,
        maxlength: 1000
    },
    referenceImages: [String],
    basePrice: Number,
    customizationFee: Number,
    totalPrice: Number,
    status: {
        type: String,
        enum: ["pending", "quoted", "accepted", "in-progress", "completed", "cancelled"],
        default: "pending"
    },
    artisanQuote: {
        price: Number,
        leadTimeDays: Number,
        message: String,
        sentAt: Date
    },
    messages: [{
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        content: String,
        sentAt: {
            type: Date,
            default: Date.now
        },
        isRead: {
            type: Boolean,
            default: false
        }
    }],
    convertedToOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }
}, { timestamps: true });

const CustomizationRequest = mongoose.model('CustomizationRequest', customizationRequestSchema);
export default CustomizationRequest;