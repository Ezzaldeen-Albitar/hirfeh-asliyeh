import Stripe from 'stripe';
import Order from '../models/Order.js';
import { createError } from '../middleware/error.middleware.js';
import { confirmOrder } from './orders.controller.js';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set.");
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}
export async function createPaymentIntent(req, res, next) {
  try {
    const { orderId } = req.body;
    const order = await Order.findOne({ _id: orderId, customer: req.user.userId });
    if (!order) throw createError(404, 'Order not found.');
    if (order.paymentStatus === 'paid') {
      throw createError(400, 'Order is already paid.');
    }
    const amountInCents = Math.round(order.totalAmount * 100);
    const paymentIntent = await getStripe().paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        customerId: req.user.userId,
      },
    });
    await Order.findByIdAndUpdate(orderId, {
      paymentIntentId: paymentIntent.id,
    });
    return res.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order._id,
      orderNumber: order.orderNumber,
    });
  } catch (err) {
    next(err);
  }
}
export async function stripeWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = getStripe().webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return res.status(400).json({ message: `Webhook error: ${err.message}` });
  }
  const io = req.app.get('io');
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      const { orderId } = paymentIntent.metadata;
      if (orderId) {
        try {
          await Order.findByIdAndUpdate(orderId, {
            paymentStatus: 'paid',
            paymentIntentId: paymentIntent.id,
          });
          await confirmOrder(orderId, io);
          console.log(`Payment succeeded for order ${orderId}`);
        } catch (err) {
          console.error('Error processing successful payment:', err);
        }
      }
      break;
    }
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      const { orderId } = paymentIntent.metadata;
      if (orderId) {
        try {
          await Order.findByIdAndUpdate(orderId, { status: 'cancelled' });
          const order = await Order.findById(orderId);
          if (order && io) {
            io.to(`user:${order.customer}`).emit('notification:new', {
              type: 'order_update',
              title: ' فشل الدفع',
              body: `فشل دفع الطلب #${order.orderNumber}. يرجى المحاولة مرة أخرى.`,
              link: `/dashboard/orders/${orderId}`,
            });
          }
          console.log(`Payment failed for order ${orderId}`);
        } catch (err) {
          console.error('Error handling failed payment:', err);
        }
      }
      break;
    }
    case 'payment_intent.canceled': {
      const paymentIntent = event.data.object;
      const { orderId } = paymentIntent.metadata;
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, { status: 'cancelled' });
      }
      break;
    }
    default:
      break;
  }
  res.json({ received: true });
}