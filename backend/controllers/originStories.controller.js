import OriginStory from '../models/OriginStory.js';
import Product from '../models/Product.js';
import ArtisanProfile from '../models/ArtisanProfile.js';
import { createError } from '../middleware/error.middleware.js';
export async function getByProduct(req, res, next) {
  try {
    const story = await OriginStory.findOne({ product: req.params.productId })
      .populate('artisan', 'craftName profileImage region user')
      .populate('product', 'title category');
    if (!story) throw createError(404, 'قصة المنشأ غير موجودة.');
    return res.json({ story });
  } catch (err) {
    next(err);
  }
}
export async function createStory(req, res, next) {
  try {
    const { productId } = req.body;
    const product = await Product.findById(productId);
    if (!product) throw createError(404, 'المنتج غير موجود.');
    const artisan = await ArtisanProfile.findOne({ user: req.user.userId });
    if (!artisan || !product.artisan.equals(artisan._id)) {
      throw createError(403, 'هذا المنتج ليس لك.');
    }
    const existing = await OriginStory.findOne({ product: productId });
    if (existing) throw createError(409, 'توجد قصة منشأ لهذا المنتج مسبقاً.');
    const story = await OriginStory.create({
      product: productId,
      artisan: artisan._id,
      ...req.body,
    });
    await Product.findByIdAndUpdate(productId, { originStory: story._id });
    return res.status(201).json({ message: 'تم إنشاء قصة المنشأ.', story });
  } catch (err) {
    next(err);
  }
}
export async function updateStory(req, res, next) {
  try {
    const story = await OriginStory.findById(req.params.id);
    if (!story) throw createError(404, 'قصة المنشأ غير موجودة.');
    if (req.user.role !== 'admin') {
      const artisan = await ArtisanProfile.findOne({ user: req.user.userId });
      if (!artisan || !story.artisan.equals(artisan._id)) {
        throw createError(403, 'غير مصرح.');
      }
    }
    delete req.body.certificateNumber;
    const updated = await OriginStory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    return res.json({ message: 'تم تحديث قصة المنشأ.', story: updated });
  } catch (err) {
    next(err);
  }
}
