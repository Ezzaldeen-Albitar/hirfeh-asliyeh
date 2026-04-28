import OriginStory from '../models/OriginStory.js';
import Product from '../models/Product.js';
import ArtisanProfile from '../models/ArtisanProfile.js';
import { createError } from '../middleware/error.middleware.js';
export async function getByProduct(req, res, next) {
  try {
    const story = await OriginStory.findOne({ product: req.params.productId })
      .populate('artisan', 'craftName profileImage region user')
      .populate('product', 'title category');
    if (!story) throw createError(404, 'Origin story not found.');
    return res.json({ story });
  } catch (err) {
    next(err);
  }
}
export async function createStory(req, res, next) {
  try {
    const { productId } = req.body;
    const product = await Product.findById(productId);
    if (!product) throw createError(404, 'Product not found.');
    const artisan = await ArtisanProfile.findOne({ user: req.user.userId });
    if (!artisan || !product.artisan.equals(artisan._id)) {
      throw createError(403, 'You do not own this product.');
    }
    const existing = await OriginStory.findOne({ product: productId });
    if (existing) throw createError(409, 'Origin story already exists for this product.');
    const story = await OriginStory.create({
      product: productId,
      artisan: artisan._id,
      ...req.body,
    });
    await Product.findByIdAndUpdate(productId, { originStory: story._id });
    return res.status(201).json({ message: 'Origin story created.', story });
  } catch (err) {
    next(err);
  }
}
export async function updateStory(req, res, next) {
  try {
    const story = await OriginStory.findById(req.params.id);
    if (!story) throw createError(404, 'Origin story not found.');
    if (req.user.role !== 'admin') {
      const artisan = await ArtisanProfile.findOne({ user: req.user.userId });
      if (!artisan || !story.artisan.equals(artisan._id)) {
        throw createError(403, 'Forbidden.');
      }
    }
    delete req.body.certificateNumber;
    const updated = await OriginStory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    return res.json({ message: 'Origin story updated.', story: updated });
  } catch (err) {
    next(err);
  }
}
