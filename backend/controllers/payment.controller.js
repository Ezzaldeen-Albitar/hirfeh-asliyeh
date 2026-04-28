import stripePackage from 'stripe';
import Order from '../models/Order.js';
import { AppError } from '../utils/AppError.js';

const stripe = stripePackage(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (req, res, next) => {
    try {
        const { orderId } = req.body;
        const order = await Order.findById(orderId);
        if (!order) return next(new AppError('Order not found', 404));
        if (order.customer.toString() !== req.user.id) {
            return next(new AppError('Unauthorized access to this order', 403));
        }
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(order.totalAmount * 100),
            currency: 'usd',
            metadata: { orderId: order._id.toString() },
            automatic_payment_methods: { enabled: true },
        });
        res.status(200).json({
            status: 'success',
            clientSecret: paymentIntent.client_secret
        });
    } catch (error) {
        next(error);
    }
};

export const confirmPayment = async (req, res, next) => {
    try {
        const { paymentIntentId, orderId } = req.body;
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        if (paymentIntent.status === 'succeeded') {
            const order = await Order.findByIdAndUpdate(
                orderId,
                {
                    isPaid: true,
                    paidAt: Date.now(),
                    paymentStatus: 'completed',
                    $push: { statusHistory: { status: 'paid', message: 'Payment successful via Stripe' } }
                },
                { new: true }
            );
            res.status(200).json({
                status: 'success',
                data: order
            });
        } else {
            return next(new AppError('Payment not successful', 400));
        }
    } catch (error) {
        next(error);
    }
};

export const stripeWebhook = async (req, res, next) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.orderId;
        await Order.findByIdAndUpdate(orderId, {
            isPaid: true,
            paidAt: Date.now(),
            paymentStatus: 'completed'
        });
    }
    res.status(200).json({ received: true });
};