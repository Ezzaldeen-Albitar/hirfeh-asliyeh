import mongoose from 'mongoose';

const workshopBookingSchema = new mongoose.Schema({
    session: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WorkshopSession',
        required: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    participants: {
        type: Number,
        default: 1
    },
    totalPrice: Number,
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "refunded"],
        default: "pending"
    },
    paymentIntentId: String,
    status: {
        type: String,
        enum: ["confirmed", "attended", "no-show", "cancelled"],
        default: "confirmed"
    },
    confirmationCode: {
        type: String,
        unique: true
    },
    specialRequests: String,
    cancelledAt: Date
}, { timestamps: true });

workshopBookingSchema.pre('save', function (next) {
    if (!this.confirmationCode) {
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        this.confirmationCode = `WB-${random}`;
    }
    next();
});

const WorkshopBooking = mongoose.model('WorkshopBooking', workshopBookingSchema);
export default WorkshopBooking;