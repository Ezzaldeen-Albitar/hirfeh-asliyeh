import Order from '../models/Order.js';
import Product from '../models/Product.js';
import ArtisanProfile from '../models/ArtisanProfile.js';
import User from '../models/User.js';
import { createError } from '../middleware/error.middleware.js';
import { createAndEmitNotification } from '../services/notification.service.js';
import { sendOrderConfirmationEmail } from '../services/mailer.service.js';

export async function createOrder(req, res, next) {
  try {
    const { items, shippingAddress, paymentMethod, notes, isGift, giftMessage } = req.body;
    if (!items || items.length === 0) {
      throw createError(400, 'Order must have at least one item.');
    }
    const orderItems = [];
    let subtotal = 0;
    for (const item of items) {
      const product = await Product.findOne({ _id: item.productId, isActive: true })
        .populate('artisan');
      if (!product) {
        throw createError(400, `Product not found: ${item.productId}`);
      }
      if (product.productType === 'ready-made' && product.stock < item.quantity) {
        throw createError(400, `Insufficient stock for "${product.title}". Available: ${product.stock}`);
      }
      orderItems.push({
        product: product._id,
        artisan: product.artisan._id,
        title: product.title,
        price: product.price,
        quantity: item.quantity,
        image: product.images[product.thumbnailIndex || 0],
        customizationRequest: item.customizationRequestId || undefined,
      });
      subtotal += product.price * item.quantity;
    }
    const totalAmount = subtotal;
    const order = await Order.create({
      customer: req.user.userId,
      items: orderItems,
      subtotal,
      totalAmount,
      shippingAddress,
      paymentMethod,
      notes,
      isGift: isGift || false,
      giftMessage,
      status: 'pending',
      paymentStatus: paymentMethod === 'stripe' ? 'pending' : 'pending',
    });
    if (paymentMethod === 'cash_on_delivery') {
      await confirmOrder(order._id, req.app.get('io'));
    }
    return res.status(201).json({ message: 'Order placed successfully.', order });
  } catch (err) {
    next(err);
  }
}
export async function confirmOrder(orderId, io) {
  const order = await Order.findById(orderId).populate('customer', 'name email');
  if (!order) return;
  order.status = 'confirmed';
  if (order.paymentMethod === 'cash_on_delivery') {
    order.paymentStatus = 'pending';
  }
  await order.save();
  for (const item of order.items) {
    await Product.findOneAndUpdate(
      { _id: item.product, productType: 'ready-made' },
      {
        $inc: { stock: -item.quantity, salesCount: item.quantity },
      }
    );
    await ArtisanProfile.findByIdAndUpdate(item.artisan, {
      $inc: { totalSales: item.quantity },
    });
  }
  await createAndEmitNotification(
    order.customer._id,
    {
      type: 'order_update',
      title: 'تم تأكيد طلبك',
      body: `طلبك #${order.orderNumber} قيد التجهيز الآن.`,
      link: `/dashboard/orders/${order._id}`,
      data: { orderId: order._id },
    },
    io
  );
  const artisanIds = [...new Set(order.items.map(i => i.artisan.toString()))];
  for (const artisanId of artisanIds) {
    const artisan = await ArtisanProfile.findById(artisanId);
    if (artisan) {
      await createAndEmitNotification(
        artisan.user,
        {
          type: 'order_update',
          title: 'طلب جديد!',
          body: `لديك طلب جديد #${order.orderNumber}.`,
          link: `/dashboard/artisan/orders`,
          data: { orderId: order._id },
        },
        io
      );
    }
  }
  try {
    await sendOrderConfirmationEmail(
      order.customer.email,
      order.customer.name,
      order.orderNumber,
      order.totalAmount
    );
  } catch (e) {
    console.error('Order email failed:', e.message);
  }
}
export async function getOrders(req, res, next) {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (req.user.role === 'customer') {
      filter.customer = req.user.userId;
    } else if (req.user.role === 'artisan') {
      const artisan = await ArtisanProfile.findOne({ user: req.user.userId });
      if (!artisan) return res.json({ orders: [], pagination: {} });
      filter['items.artisan'] = artisan._id;
    }
    if (status) filter.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('customer', 'name email avatar')
        .lean(),
      Order.countDocuments(filter),
    ]);
    return res.json({
      orders,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
}
export async function getOrder(req, res, next) {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email avatar phone')
      .populate('items.product', 'title images category')
      .populate('items.artisan', 'craftName profileImage user');
    if (!order) throw createError(404, 'Order not found.');
    const isOwner = order.customer._id.toString() === req.user.userId;
    const isArtisan = order.items.some(i => {
      return i.artisan?.user?.toString() === req.user.userId;
    });
    if (req.user.role !== 'admin' && !isOwner && !isArtisan) {
      throw createError(403, 'Forbidden.');
    }
    return res.json({ order });
  } catch (err) {
    next(err);
  }
}
const VALID_STATUS_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['in-progress', 'cancelled'],
  'in-progress': ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};
export async function updateOrderStatus(req, res, next) {
  try {
    const { status, note, trackingNumber, estimatedDelivery } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) throw createError(404, 'Order not found.');
    const validTransitions = VALID_STATUS_TRANSITIONS[order.status] || [];
    if (!validTransitions.includes(status)) {
      throw createError(400, `Cannot transition from "${order.status}" to "${status}".`);
    }
    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;
    order.statusHistory.push({ status, note, changedBy: req.user.userId });
    await order.save();
    const io = req.app.get('io');
    await createAndEmitNotification(
      order.customer,
      {
        type: 'order_update',
        title: `تحديث الطلب #${order.orderNumber}`,
        body: `تم تحديث حالة طلبك إلى: ${status}`,
        link: `/dashboard/orders/${order._id}`,
        data: { orderId: order._id, status },
      },
      io
    );
    io?.to(`order:${order._id}`).emit('order:status_updated', {
      orderId: order._id,
      status,
    });
    return res.json({ message: 'Order status updated.', order });
  } catch (err) {
    next(err);
  }
}
export async function cancelOrder(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) throw createError(404, 'Order not found.');
    if (!order.customer.equals(req.user.userId)) {
      throw createError(403, 'You can only cancel your own orders.');
    }
    if (order.status !== 'pending') {
      throw createError(400, 'Only pending orders can be cancelled by the customer.');
    }
    order.status = 'cancelled';
    order.statusHistory.push({ status: 'cancelled', note: 'Cancelled by customer', changedBy: req.user.userId });
    await order.save();
    return res.json({ message: 'Order cancelled.', order });
  } catch (err) {
    next(err);
  }
}