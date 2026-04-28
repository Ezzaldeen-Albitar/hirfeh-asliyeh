import WorkshopSession from '../models/WorkshopSession.js';
import WorkshopBooking from '../models/WorkshopBooking.js';
import ArtisanProfile from '../models/ArtisanProfile.js';
import { createError } from '../middleware/error.middleware.js';
import { createAndEmitNotification } from '../services/notification.service.js';

export async function getWorkshops(req, res, next) {
  try {
    const { page = 1, limit = 12, artisan, locationType, skillLevel, status = 'upcoming' } = req.query;
    const filter = { status };
    if (artisan) filter.artisan = artisan;
    if (locationType) filter.locationType = locationType;
    if (skillLevel) filter.skillLevel = skillLevel;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [sessions, total] = await Promise.all([
      WorkshopSession.find(filter)
        .sort({ 'schedule.date': 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('artisan', 'craftName profileImage region isVerified')
        .lean(),
      WorkshopSession.countDocuments(filter),
    ]);
    return res.json({
      sessions,
      pagination: { total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
}

export async function getWorkshop(req, res, next) {
  try {
    const session = await WorkshopSession.findById(req.params.id)
      .populate({
        path: 'artisan',
        select: 'craftName profileImage region isVerified bio rating',
        populate: { path: 'user', select: 'name avatar' },
      });
    if (!session) throw createError(404, 'Workshop not found.');
    return res.json({ session });
  } catch (err) {
    next(err);
  }
}
export async function createWorkshop(req, res, next) {
  try {
    const artisan = await ArtisanProfile.findOne({ user: req.user.userId });
    if (!artisan) throw createError(404, 'Artisan profile not found.');
    const session = await WorkshopSession.create({
      artisan: artisan._id,
      ...req.body,
    });
    return res.status(201).json({ message: 'Workshop session created.', session });
  } catch (err) {
    next(err);
  }
}

export async function updateWorkshop(req, res, next) {
  try {
    const session = await WorkshopSession.findById(req.params.id);
    if (!session) throw createError(404, 'Workshop not found.');
    if (req.user.role !== 'admin') {
      const artisan = await ArtisanProfile.findOne({ user: req.user.userId });
      if (!artisan || !session.artisan.equals(artisan._id)) {
        throw createError(403, 'Forbidden.');
      }
    }
    const updated = await WorkshopSession.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.json({ message: 'Workshop updated.', session: updated });
  } catch (err) {
    next(err);
  }
}
export async function deleteWorkshop(req, res, next) {
  try {
    const session = await WorkshopSession.findById(req.params.id);
    if (!session) throw createError(404, 'Workshop not found.');
    if (req.user.role !== 'admin') {
      const artisan = await ArtisanProfile.findOne({ user: req.user.userId });
      if (!artisan || !session.artisan.equals(artisan._id)) {
        throw createError(403, 'Forbidden.');
      }
    }
    await WorkshopSession.findByIdAndUpdate(req.params.id, { status: 'cancelled' });
    return res.json({ message: 'Workshop cancelled.' });
  } catch (err) {
    next(err);
  }
}
export async function bookWorkshop(req, res, next) {
  try {
    const { participants = 1, specialRequests, paymentMethod = 'cash_on_delivery' } = req.body;
    const session = await WorkshopSession.findById(req.params.id);
    if (!session) throw createError(404, 'Workshop not found.');
    if (session.status !== 'upcoming') throw createError(400, 'This workshop is not available for booking.');
    const availableSpots = session.capacity - session.bookedCount;
    if (participants > availableSpots) {
      throw createError(400, `Only ${availableSpots} spot(s) remaining.`);
    }
    const existing = await WorkshopBooking.findOne({
      session: session._id,
      customer: req.user.userId,
      status: { $ne: 'cancelled' },
    });
    if (existing) {
      throw createError(409, 'You already have a booking for this workshop.');
    }
    const totalPrice = session.price * participants;
    const booking = await WorkshopBooking.create({
      session: session._id,
      customer: req.user.userId,
      participants,
      totalPrice,
      specialRequests,
      paymentStatus: 'pending',
    });
    await WorkshopSession.findByIdAndUpdate(session._id, { $inc: { bookedCount: participants } });
    const artisan = await ArtisanProfile.findById(session.artisan);
    if (artisan) {
      const io = req.app.get('io');
      await createAndEmitNotification(
        artisan.user,
        {
          type: 'workshop',
          title: 'حجز ورشة جديد',
          body: `تم حجز ${participants} مقعد في ورشة "${session.title}"`,
          link: `/dashboard/artisan`,
          data: { bookingId: booking._id },
        },
        io
      );
    }
    return res.status(201).json({
      message: 'Workshop booked successfully.',
      booking,
      confirmationCode: booking.confirmationCode,
    });
  } catch (err) {
    next(err);
  }
}
export async function getSessionBookings(req, res, next) {
  try {
    const session = await WorkshopSession.findById(req.params.id);
    if (!session) throw createError(404, 'Workshop not found.');
    if (req.user.role !== 'admin') {
      const artisan = await ArtisanProfile.findOne({ user: req.user.userId });
      if (!artisan || !session.artisan.equals(artisan._id)) {
        throw createError(403, 'Forbidden.');
      }
    }
    const bookings = await WorkshopBooking.find({ session: session._id })
      .populate('customer', 'name email avatar phone')
      .lean();
    return res.json({ bookings });
  } catch (err) {
    next(err);
  }
}