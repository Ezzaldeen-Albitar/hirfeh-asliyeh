import Stripe from 'stripe';
import Order from '../models/Order.js';
import { createError } from '../middleware/error.middleware.js';
import { confirmOrder } from './orders.controller.js';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set.");
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

async function finalizePaidOrder(orderId, paymentIntentId, io) {
  await Order.findByIdAndUpdate(orderId, {
    paymentStatus: 'paid',
    paymentIntentId,
  });
  await confirmOrder(orderId, io);
  return Order.findById(orderId);
}

export async function createPaymentIntent(req, res, next) {
  try {
    const { orderId } = req.body;
    const order = await Order.findOne({ _id: orderId, customer: req.user.userId });
    if (!order) throw createError(404, 'الطلب غير موجود.');
    if (order.paymentMethod !== 'stripe') {
      throw createError(400, 'هذا الطلب غير مهيأ للدفع بالبطاقة.');
    }
    if (order.paymentStatus === 'paid') {
      throw createError(400, 'تم دفع هذا الطلب مسبقاً.');
    }
    const JOD_TO_USD = parseFloat(process.env.STRIPE_JOD_TO_USD_RATE || '1.41');
    const amountInCents = Math.round(order.totalAmount * JOD_TO_USD * 100);
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

export async function confirmPaymentIntent(req, res, next) {
  try {
    const { orderId } = req.body;
    const order = await Order.findOne({ _id: orderId, customer: req.user.userId });
    if (!order) throw createError(404, 'الطلب غير موجود.');
    if (order.paymentMethod !== 'stripe') {
      throw createError(400, 'هذا الطلب غير مهيأ للدفع بالبطاقة.');
    }
    if (!order.paymentIntentId) {
      throw createError(400, 'لم يتم إنشاء عملية دفع لهذا الطلب بعد.');
    }

    const paymentIntent = await getStripe().paymentIntents.retrieve(order.paymentIntentId);
    if (paymentIntent.metadata?.orderId !== order._id.toString()) {
      throw createError(400, 'عملية الدفع لا تتبع هذا الطلب.');
    }

    if (paymentIntent.status === 'succeeded') {
      const paidOrder = await finalizePaidOrder(order._id, paymentIntent.id, req.app.get('io'));
      return res.json({
        message: 'تم تأكيد الدفع بنجاح.',
        order: paidOrder,
        paymentStatus: paymentIntent.status,
      });
    }

    if (paymentIntent.status === 'processing') {
      return res.status(202).json({
        message: 'الدفع ما زال قيد المعالجة.',
        paymentStatus: paymentIntent.status,
      });
    }

    throw createError(400, `Payment is not complete yet. Current status: ${paymentIntent.status}`);
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
          await finalizePaidOrder(orderId, paymentIntent.id, io);
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
