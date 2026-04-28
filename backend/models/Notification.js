import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const notificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['order_update', 'message', 'customization', 'workshop', 'review', 'system'],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    link: String,
    isRead: { type: Boolean, default: false },
    readAt: Date,
    data: Schema.Types.Mixed,
  },
  { timestamps: true }
);
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

export default model('Notification', notificationSchema);
