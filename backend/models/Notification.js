import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ["order_update", "message", "customization", "workshop", "review", "system"]
    },
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    link: String,
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: Date,
    data: mongoose.Schema.Types.Mixed
}, { timestamps: true });

notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;