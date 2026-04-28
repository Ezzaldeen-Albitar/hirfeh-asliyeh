import Notification from '../models/Notification.js';
import { createError } from '../middleware/error.middleware.js';
export async function getNotifications(req, res, next) {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const filter = { recipient: req.user.userId };
    if (unreadOnly === 'true') filter.isRead = false;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [notifications, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Notification.countDocuments({ recipient: req.user.userId, isRead: false }),
    ]);
    return res.json({ notifications, unreadCount });
  } catch (err) {
    next(err);
  }
}
export async function markAsRead(req, res, next) {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user.userId,
    });
    if (!notification) throw createError(404, 'Notification not found.');
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();
    return res.json({ message: 'Marked as read.' });
  } catch (err) {
    next(err);
  }
}
export async function markAllAsRead(req, res, next) {
  try {
    await Notification.updateMany(
      { recipient: req.user.userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );
    return res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
}
