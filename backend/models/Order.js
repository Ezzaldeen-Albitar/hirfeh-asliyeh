import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        artisan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ArtisanProfile'
        },
        title: String,
        price: Number,
        quantity: Number,
        image: String,
        customizationRequest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CustomizationRequest'
        }
    }],
    subtotal: Number,
    shippingCost: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: "JOD"
    },
    shippingAddress: {
        recipientName: String,
        phone: String,
        city: String,
        governorate: String,
        street: String,
        notes: String
    },
    paymentMethod: {
        type: String,
        enum: ["cash_on_delivery", "stripe", "cliq"]
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "refunded"],
        default: "pending"
    },
    paymentIntentId: String,
    stripeSessionId: String,
    status: {
        type: String,
        enum: ["pending", "confirmed", "in-progress", "shipped", "delivered", "cancelled"],
        default: "pending"
    },
    statusHistory: [{
        status: String,
        note: String,
        changedAt: {
            type: Date,
            default: Date.now
        }
    }],
    trackingNumber: String,
    estimatedDelivery: Date,
    notes: String,
    isGift: {
        type: Boolean,
        default: false
    },
    giftMessage: String
}, { timestamps: true });

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ "items.artisan": 1, status: 1 });

orderSchema.pre('save', async function (next) {
    if (!this.orderNumber) {
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.floor(1000 + Math.random() * 9000);
        this.orderNumber = `ORD-${date}-${random}`;
    }
    next();
});

const Order = mongoose.model('Order', orderSchema);
export default Order;