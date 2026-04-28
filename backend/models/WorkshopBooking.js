import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const workshopBookingSchema = new Schema(
    {
        session: {
            type: Schema.Types.ObjectId,
            ref: 'WorkshopSession',
            required: true,
        },
        customer: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        participants: { type: Number, default: 1, min: 1 },
        totalPrice: { type: Number, required: true },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'refunded'],
            default: 'pending',
        },
        paymentIntentId: String,
        status: {
            type: String,
            enum: ['confirmed', 'attended', 'no-show', 'cancelled'],
            default: 'confirmed',
        },
        confirmationCode: String,
        specialRequests: String,
        cancelledAt: Date,
    },
    { timestamps: true }
);
workshopBookingSchema.index({ session: 1, customer: 1 });
workshopBookingSchema.index({ customer: 1, createdAt: -1 });
workshopBookingSchema.pre('save', function (next) {
    if (!this.confirmationCode) {
        const random = Math.floor(1000 + Math.random() * 9000);
        this.confirmationCode = `WB-${random}`;
    }
    next();
});

export default model('WorkshopBooking', workshopBookingSchema);