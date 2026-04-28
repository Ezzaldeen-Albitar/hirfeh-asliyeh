import Notification from '../models/Notification.js';

/**
 * @param {string} recipientId
 * @param {object} data 
 * @param {object} io 
 */
export async function createAndEmitNotification(recipientId, data, io) {
    const notification = await Notification.create({
        recipient: recipientId,
        type: data.type,
        title: data.title,
        body: data.body,
        link: data.link,
        data: data.data || {},
    });
    io?.to(`user:${recipientId}`).emit('notification:new', notification);
    return notification;
}