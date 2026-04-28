import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const orderItemSchema = new Schema(
    {
        product: { type: Schema.Types.ObjectId, ref: 'Product' },
        artisan: { type: Schema.Types.ObjectId, ref: 'ArtisanProfile' },
        title: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        image: String,
        customizationRequest: { type: Schema.Types.ObjectId, ref: 'CustomizationRequest' },
    },
    { _id: true }
);
const statusHistorySchema = new Schema(
    {
        status: String,
        note: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { _id: false }
);
const orderSchema = new Schema(
    {
        orderNumber: {
            type: String,
            unique: true,
        },
        customer: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        items: {
            type: [orderItemSchema],
            required: true,
            validate: {
                validator: (v) => v.length >= 1,
                message: 'Order must have at least one item',
            },
        },
        subtotal: { type: Number, required: true },
        shippingCost: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        totalAmount: { type: Number, required: true },
        currency: { type: String, default: 'JOD' },
        shippingAddress: {
            recipientName: { type: String, required: true },
            phone: { type: String, required: true },
            city: { type: String, required: true },
            governorate: { type: String, required: true },
            street: String,
            notes: String,
        },
        paymentMethod: {
            type: String,
            enum: ['cash_on_delivery', 'stripe', 'cliq'],
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'refunded'],
            default: 'pending',
        },
        paymentIntentId: String,
        stripeSessionId: String,
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'in-progress', 'shipped', 'delivered', 'cancelled'],
            default: 'pending',
        },
        statusHistory: [statusHistorySchema],
        trackingNumber: String,
        estimatedDelivery: Date,
        notes: String,
        isGift: { type: Boolean, default: false },
        giftMessage: String,
    },
    { timestamps: true }
);

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ 'items.artisan': 1, status: 1 });
orderSchema.index({ paymentIntentId: 1 }, { sparse: true });

orderSchema.pre('save', function (next) {
    if (!this.orderNumber) {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.floor(1000 + Math.random() * 9000);
        this.orderNumber = `ORD-${dateStr}-${random}`;
    }
    if (this.isModified('status')) {
        this.statusHistory.push({ status: this.status });
    }
    next();
});
export default model('Order', orderSchema);