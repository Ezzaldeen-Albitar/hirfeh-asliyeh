import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { AppError } from '../utils/AppError.js';

export const createOrder = async (req, res, next) => {
    try {
        const { items, shippingAddress } = req.body;
        let totalAmount = 0;
        const orderItems = [];
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) return next(new AppError(`Product ${item.product} not found`, 404));
            if (product.stock < item.quantity) {
                return next(new AppError(`Insufficient stock for ${product.title}`, 400));
            }
            totalAmount += product.price * item.quantity;
            orderItems.push({
                product: product._id,
                title: product.title,
                price: product.price,
                quantity: item.quantity,
                artisan: product.artisan
            });
            product.stock -= item.quantity;
            await product.save();
        }
        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const order = await Order.create({
            orderNumber,
            customer: req.user.id,
            items: orderItems,
            totalAmount,
            shippingAddress,
            status: 'pending',
            statusHistory: [{ status: 'pending', message: 'Order placed successfully' }]
        });
        res.status(201).json({
            status: 'success',
            data: order
        });
    } catch (error) {
        next(error);
    }
};

export const getMyOrders = async (req, res, next) => {
    try {
        let filter = {};
        if (req.user.role === 'customer') filter = { customer: req.user.id };
        if (req.user.role === 'artisan') filter = { 'items.artisan': req.user.id };
        if (req.user.role === 'admin') filter = {};
        const orders = await Order.find(filter)
            .sort('-createdAt')
            .populate('customer', 'name email');
        res.status(200).json({
            status: 'success',
            results: orders.length,
            data: orders
        });
    } catch (error) {
        next(error);
    }
};

export const getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('customer', 'name email')
            .populate('items.product');
        if (!order) return next(new AppError('Order not found', 404));
        const isOwner = order.customer.id === req.user.id ||
            order.items.some(item => item.artisan.toString() === req.user.id) ||
            req.user.role === 'admin';
        if (!isOwner) return next(new AppError('Not authorized to view this order', 403));
        res.status(200).json({
            status: 'success',
            data: order
        });
    } catch (error) {
        next(error);
    }
};

export const updateOrderStatus = async (req, res, next) => {
    try {
        const { status, message } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return next(new AppError('Order not found', 404));
        order.status = status;
        order.statusHistory.push({ status, message, timestamp: Date.now() });
        await order.save();
        res.status(200).json({
            status: 'success',
            data: order
        });
    } catch (error) {
        next(error);
    }
};

export const cancelOrder = async (req, res, next) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            customer: req.user.id,
            status: 'pending'
        });
        if (!order) {
            return next(new AppError('Order cannot be cancelled (Not found or already processing)', 400));
        }
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: item.quantity }
            });
        }
        order.status = 'cancelled';
        order.statusHistory.push({ status: 'cancelled', message: 'Cancelled by customer', timestamp: Date.now() });
        await order.save();
        res.status(200).json({
            status: 'success',
            message: 'Order cancelled and stock restored'
        });
    } catch (error) {
        next(error);
    }
};