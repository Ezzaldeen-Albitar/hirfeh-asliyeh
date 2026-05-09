import CustomizationRequest from '../models/CustomizationRequest.js';
import ArtisanProfile from '../models/ArtisanProfile.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { createError } from '../middleware/error.middleware.js';
import { createAndEmitNotification } from '../services/notification.service.js';

export async function createRequest(req, res, next) {
  try {
    const {
      productId,
      artisan,
      artisanId,
      requestedOptions,
      customerNotes,
      description,
      budget,
      deadline,
      referenceImages,
    } = req.body;

    let product = null;
    let artisanProfile = null;

    if (productId) {
      product = await Product.findOne({
        _id: productId,
        isActive: true,
        allowsCustomization: true,
      });
      if (!product) {
        throw createError(404, 'Product not found or does not allow customization.');
      }
      artisanProfile = await ArtisanProfile.findById(product.artisan);
    } else {
      const targetArtisanId = artisanId || artisan;
      if (!targetArtisanId) {
        throw createError(400, 'Artisan is required.');
      }
      artisanProfile = await ArtisanProfile.findById(targetArtisanId);
      if (!artisanProfile || !artisanProfile.isActive || artisanProfile.acceptsCustomOrders === false) {
        throw createError(404, 'Artisan not found or does not accept custom orders.');
      }
    }

    const notes = (customerNotes || description || '').trim();
    if (!notes) {
      throw createError(400, 'Description is required.');
    }

    const parsedBudget = budget !== undefined && budget !== '' ? Number(budget) : undefined;
    if (parsedBudget !== undefined && !Number.isFinite(parsedBudget)) {
      throw createError(400, 'Budget must be a valid number.');
    }

    const request = await CustomizationRequest.create({
      product: product?._id,
      artisan: artisanProfile._id,
      customer: req.user.userId,
      requestedOptions: requestedOptions || {},
      customerNotes: notes,
      requestedBudget: parsedBudget,
      requestedDeadline: deadline || undefined,
      referenceImages: referenceImages || [],
      basePrice: product?.price,
      messages: [
        {
          sender: req.user.userId,
          content: notes,
          sentAt: new Date(),
          isRead: false,
        },
      ],
    });

    const io = req.app.get('io');
    await createAndEmitNotification(
      artisanProfile.user,
      {
        type: 'customization',
        title: 'New customization request',
        body: product
          ? `Customization request on product: ${product.title}`
          : 'Direct customization request from a customer',
        link: `/customizations?request=${request._id}`,
        data: { requestId: request._id },
      },
      io
    );

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

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const requests = await CustomizationRequest.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .populate('product', 'title images price')
      .populate('customer', 'name avatar')
      .populate({
        path: 'artisan',
        select: 'user craftName profileImage',
        populate: { path: 'user', select: 'name avatar' },
      })
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

    request.artisanQuote = {
      price: parseFloat(price),
      leadTimeDays: parseInt(leadTimeDays, 10),
      message,
      sentAt: new Date(),
    };
    request.totalPrice = parseFloat(price);
    request.status = 'quoted';
    await request.save();

    const io = req.app.get('io');
    await createAndEmitNotification(
      request.customer,
      {
        type: 'customization',
        title: 'Quote sent',
        body: `The artisan sent a quote: ${price} JOD`,
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
    if (!request.product || !request.artisanQuote?.price) {
      throw createError(400, 'This request cannot be converted into an order.');
    }
    if (!request.canTransitionTo('accepted')) {
      throw createError(400, 'Quote cannot be accepted at this stage.');
    }

    request.status = 'accepted';
    await request.save();

    const order = await Order.create({
      customer: req.user.userId,
      items: [
        {
          product: request.product._id,
          artisan: request.artisan._id,
          title: request.product.title,
          price: request.artisanQuote.price,
          quantity: request.requestedOptions?.quantity || 1,
          image: request.product.images?.[0],
          customizationRequest: request._id,
        },
      ],
      subtotal: request.artisanQuote.price,
      totalAmount: request.artisanQuote.price,
      shippingAddress: req.body.shippingAddress || {
        recipientName: 'To be confirmed',
        phone: 'To be confirmed',
        city: 'Amman',
        governorate: 'Amman',
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
        title: 'Quote accepted',
        body: 'The customer accepted the quote. An order was created.',
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
      .populate('customer', 'name avatar')
      .populate({
        path: 'artisan',
        select: 'user craftName profileImage',
        populate: { path: 'user', select: 'name avatar' },
      });

    if (!request) throw createError(404, 'Request not found.');

    const isCustomer = request.customer._id.toString() === req.user.userId;
    const isArtisan = request.artisan?.user?._id?.toString() === req.user.userId;
    if (!isCustomer && !isArtisan && req.user.role !== 'admin') {
      throw createError(403, 'Forbidden.');
    }
    if (!content?.trim()) {
      throw createError(400, 'Message content is required.');
    }

    const message = {
      sender: req.user.userId,
      content: content.trim(),
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

    const recipientId = isCustomer
      ? request.artisan?.user?._id?.toString()
      : request.customer?._id?.toString();

    if (recipientId && recipientId !== req.user.userId) {
      const customerName = request.customer?.name || '\u0627\u0644\u0639\u0645\u064a\u0644';
      const artisanName =
        request.artisan?.craftName ||
        request.artisan?.user?.name ||
        '\u0627\u0644\u062d\u0631\u0641\u064a';
      const senderName = isCustomer ? customerName : artisanName;
      const preview = content.trim().slice(0, 80);
      const title = '\u0631\u0633\u0627\u0644\u0629 \u062e\u0627\u0635\u0629 \u062c\u062f\u064a\u062f\u0629';
      const body = isCustomer
        ? `${senderName} \u0623\u0631\u0633\u0644 \u0644\u0643 \u0631\u0633\u0627\u0644\u0629 \u062e\u0627\u0635\u0629${preview ? `: ${preview}` : ''}`
        : `${senderName} \u0631\u062f \u0639\u0644\u0649 \u0631\u0633\u0627\u0644\u062a\u0643 \u0627\u0644\u062e\u0627\u0635\u0629${preview ? `: ${preview}` : ''}`;

      await createAndEmitNotification(
        recipientId,
        {
          type: 'message',
          title,
          body,
          link: `/customizations?request=${request._id}`,
          data: {
            requestId: request._id,
            senderId: req.user.userId,
            senderName,
            kind: 'private_message',
          },
        },
        io
      );
    }

    return res.status(201).json({ message: 'Message sent.', chatMessage: savedMsg });
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const nextStatus = req.body.status === 'processing' ? 'in-progress' : req.body.status;
    const request = await CustomizationRequest.findById(req.params.id).populate('artisan', 'user');

    if (!request) throw createError(404, 'Request not found.');

    const isCustomer = request.customer?.toString() === req.user.userId;
    const artisanUserId = request.artisan?.user?.toString();
    const isArtisan = artisanUserId === req.user.userId;

    if (!isCustomer && !isArtisan && req.user.role !== 'admin') {
      throw createError(403, 'Forbidden.');
    }
    if (nextStatus === 'in-progress' && !isArtisan && req.user.role !== 'admin') {
      throw createError(403, 'Only the artisan can start the request.');
    }
    if (!request.canTransitionTo(nextStatus)) {
      throw createError(400, `Cannot change status from ${request.status} to ${nextStatus}.`);
    }

    request.status = nextStatus;
    await request.save();

    return res.json({ message: 'Status updated.', request });
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
