import CustomizationRequest from '../models/CustomizationRequest.js';
import ArtisanProfile from '../models/ArtisanProfile.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { createError } from '../middleware/error.middleware.js';
import { createAndEmitNotification } from '../services/notification.service.js';
export async function createRequest(req, res, next) {
  try {
    const { productId, requestedOptions, customerNotes, referenceImages } = req.body;
    const product = await Product.findOne({ _id: productId, isActive: true, allowsCustomization: true });
    if (!product) throw createError(404, 'Product not found or does not allow customization.');
    const request = await CustomizationRequest.create({
      product: productId,
      artisan: product.artisan,
      customer: req.user.userId,
      requestedOptions,
      customerNotes,
      referenceImages: referenceImages || [],
      basePrice: product.price,
    });
    const io = req.app.get('io');
    const artisan = await ArtisanProfile.findById(product.artisan);
    if (artisan) {
      await createAndEmitNotification(
        artisan.user,
        {
          type: 'customization',
          title: 'طلب تخصيص جديد',
          body: `طلب تخصيص على منتج: ${product.title}`,
          link: `/dashboard/artisan/customizations`,
          data: { requestId: request._id },
        },
        io
      );
    }
    return res.status(201).json({ message: 'Customization request submitted.', request });
  } catch (err) {
    next(err);
  }
}
export async function getRequests(req, res, next) {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (req.user.role === 'customer') {
      filter.customer = req.user.userId;
    } else if (req.user.role === 'artisan') {
      const artisan = await ArtisanProfile.findOne({ user: req.user.userId });
      if (!artisan) return res.json({ requests: [] });
      filter.artisan = artisan._id;
    }
    if (status) filter.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const requests = await CustomizationRequest.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('product', 'title images')
      .populate('customer', 'name avatar')
      .lean();
    return res.json({ requests });
  } catch (err) {
    next(err);
  }
}
export async function getRequest(req, res, next) {
  try {
    const request = await CustomizationRequest.findById(req.params.id)
      .populate('product', 'title images price')
      .populate('customer', 'name avatar email')
      .populate({ path: 'artisan', populate: { path: 'user', select: 'name avatar' } })
      .populate('messages.sender', 'name avatar role');
    if (!request) throw createError(404, 'Request not found.');
    const isCustomer = request.customer._id.toString() === req.user.userId;
    const isArtisan = request.artisan?.user?._id?.toString() === req.user.userId;
    if (req.user.role !== 'admin' && !isCustomer && !isArtisan) {
      throw createError(403, 'Forbidden.');
    }
    return res.json({ request });
  } catch (err) {
    next(err);
  }
}
export async function sendQuote(req, res, next) {
  try {
    const { price, leadTimeDays, message } = req.body;
    const request = await CustomizationRequest.findById(req.params.id);
    if (!request) throw createError(404, 'Request not found.');
    if (!request.canTransitionTo('quoted')) {
      throw createError(400, `Cannot quote from status: ${request.status}`);
    }
    request.artisanQuote = { price: parseFloat(price), leadTimeDays: parseInt(leadTimeDays), message, sentAt: new Date() };
    request.totalPrice = parseFloat(price);
    request.status = 'quoted';
    await request.save();
    const io = req.app.get('io');
    await createAndEmitNotification(
      request.customer,
      {
        type: 'customization',
        title: 'تم إرسال عرض سعر',
        body: `الحرفي أرسل عرض سعر: ${price} دينار`,
        link: `/dashboard/customizations/${request._id}`,
        data: { requestId: request._id },
      },
      io
    );
    io?.to(`customization:${request._id}`).emit('customization:quoted', {
      requestId: request._id,
      quote: request.artisanQuote,
    });
    return res.json({ message: 'Quote sent.', request });
  } catch (err) {
    next(err);
  }
}
export async function acceptQuote(req, res, next) {
  try {
    const request = await CustomizationRequest.findById(req.params.id)
      .populate('product')
      .populate('artisan');
    if (!request) throw createError(404, 'Request not found.');
    if (!request.customer.equals(req.user.userId)) throw createError(403, 'Forbidden.');
    if (!request.canTransitionTo('accepted')) {
      throw createError(400, 'Quote cannot be accepted at this stage.');
    }
    request.status = 'accepted';
    await request.save();
    const order = await Order.create({
      customer: req.user.userId,
      items: [{
        product: request.product._id,
        artisan: request.artisan._id,
        title: request.product.title,
        price: request.artisanQuote.price,
        quantity: request.requestedOptions?.quantity || 1,
        image: request.product.images[0],
        customizationRequest: request._id,
      }],
      subtotal: request.artisanQuote.price,
      totalAmount: request.artisanQuote.price,
      shippingAddress: req.body.shippingAddress || {
        recipientName: 'To be confirmed',
        phone: 'To be confirmed',
        city: 'Amman',
        governorate: 'عمّان',
      },
      paymentMethod: req.body.paymentMethod || 'cash_on_delivery',
    });
    request.convertedToOrder = order._id;
    request.status = 'in-progress';
    await request.save();
    const io = req.app.get('io');
    await createAndEmitNotification(
      request.artisan.user,
      {
        type: 'customization',
        title: 'قبِل العميل العرض!',
        body: 'قبل العميل عرض السعر. تم إنشاء الطلب.',
        link: `/dashboard/artisan/orders`,
        data: { orderId: order._id },
      },
      io
    );
    return res.json({ message: 'Quote accepted. Order created.', order, request });
  } catch (err) {
    next(err);
  }
}
export async function sendMessage(req, res, next) {
  try {
    const { content } = req.body;
    const request = await CustomizationRequest.findById(req.params.id)
      .populate('customer artisan');
    if (!request) throw createError(404, 'Request not found.');
    const isCustomer = request.customer._id.toString() === req.user.userId;
    const isArtisan = request.artisan?.user?.toString() === req.user.userId;
    if (!isCustomer && !isArtisan && req.user.role !== 'admin') {
      throw createError(403, 'Forbidden.');
    }
    const message = {
      sender: req.user.userId,
      content,
      sentAt: new Date(),
      isRead: false,
    };
    request.messages.push(message);
    await request.save();
    const savedMsg = request.messages[request.messages.length - 1];
    const io = req.app.get('io');
    io?.to(`customization:${request._id}`).emit('receive:message', {
      ...savedMsg.toObject(),
      customizationId: request._id,
    });
    return res.status(201).json({ message: 'Message sent.', chatMessage: savedMsg });
  } catch (err) {
    next(err);
  }
}
export async function completeRequest(req, res, next) {
  try {
    const request = await CustomizationRequest.findById(req.params.id);
    if (!request) throw createError(404, 'Request not found.');
    if (!request.canTransitionTo('completed')) {
      throw createError(400, 'Cannot complete at this stage.');
    }
    request.status = 'completed';
    await request.save();
    return res.json({ message: 'Request marked as completed.', request });
  } catch (err) {
    next(err);
  }
}
