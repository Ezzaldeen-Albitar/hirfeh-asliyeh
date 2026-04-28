import mongoose from 'mongoose';
import Product from '../models/Product.js';
import ArtisanProfile from '../models/ArtisanProfile.js';
import OriginStory from '../models/OriginStory.js';
import { createError } from '../middleware/error.middleware.js';
export async function getProducts(req, res, next) {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      minPrice,
      maxPrice,
      type,
      region,
      search,
      artisan,
      sort = 'newest',
      featured,
      verified,
    } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (type) filter.productType = type;
    if (artisan) filter.artisan = artisan;
    if (featured === 'true') filter.isFeatured = true;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    if (search) {
      filter.$text = { $search: search };
    }
    if (region || verified === 'true') {
      const artisanFilter = {};
      if (region) artisanFilter.region = region;
      if (verified === 'true') artisanFilter.isVerified = true;
      const artisanIds = await ArtisanProfile.find(artisanFilter).distinct('_id');
      filter.artisan = { $in: artisanIds };
    }
    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      rating: { rating: -1 },
      popular: { salesCount: -1, viewCount: -1 },
    };
    const sortQuery = sortMap[sort] || sortMap.newest;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sortQuery)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('artisan', 'craftName region profileImage isVerified rating badges')
        .populate('originStory', 'certificateNumber origin.region')
        .lean(),
      Product.countDocuments(filter),
    ]);
    return res.json({
      products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
        hasNext: skip + products.length < total,
      },
    });
  } catch (err) {
    next(err);
  }
}
export async function getProduct(req, res, next) {
  try {
    const product = await Product.findOne({ _id: req.params.id, isActive: true })
      .populate({
        path: 'artisan',
        select: 'craftName region profileImage isVerified rating reviewCount badges bio socialLinks',
        populate: { path: 'badges', select: 'nameAr nameEn icon' },
      })
      .populate('originStory');
    if (!product) throw createError(404, 'Product not found.');
    Product.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } }).exec();
    return res.json({ product });
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req, res, next) {
  try {
    const artisanProfile = await ArtisanProfile.findOne({ user: req.user.userId });
    if (!artisanProfile) {
      throw createError(404, 'Artisan profile not found. Please complete your artisan setup.');
    }
    const {
      title, description, price, category, productType,
      stock, leadTimeDays, materials, dimensions, weight,
      allowsCustomization, customizationOptions, tags, images,
      thumbnailIndex,
      originRegion, originVillage, originLat, originLng,
      craftingProcess, materialsSource, culturalSignificance,
      artisanPersonalNote, estimatedCraftingTime, generationsTaught,
    } = req.body;
    const productData = {
      artisan: artisanProfile._id,
      title, description, price: parseFloat(price),
      category, productType,
      images: Array.isArray(images) ? images : [images],
      thumbnailIndex: thumbnailIndex || 0,
      tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
      allowsCustomization: allowsCustomization === 'true' || allowsCustomization === true,
      customizationOptions,
      materials: Array.isArray(materials) ? materials : (materials ? [materials] : []),
      dimensions, weight,
    };
    if (productType === 'ready-made') productData.stock = parseInt(stock) || 1;
    if (productType === 'made-to-order') productData.leadTimeDays = parseInt(leadTimeDays);
    const product = await Product.create(productData);
    if (craftingProcess && materialsSource && culturalSignificance) {
      const originStory = await OriginStory.create({
        product: product._id,
        artisan: artisanProfile._id,
        origin: {
          region: originRegion || artisanProfile.region,
          village: originVillage,
          coordinates: originLat && originLng
            ? { lat: parseFloat(originLat), lng: parseFloat(originLng) }
            : undefined,
        },
        craftingProcess,
        materialsSource,
        culturalSignificance,
        artisanPersonalNote,
        estimatedCraftingTime,
        generationsTaught,
      });
      await Product.findByIdAndUpdate(product._id, { originStory: originStory._id });
      product.originStory = originStory._id;
    }
    return res.status(201).json({ message: 'Product created successfully.', product });
  } catch (err) {
    next(err);
  }
}
export async function updateProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) throw createError(404, 'Product not found.');
    if (req.user.role !== 'admin') {
      const artisanProfile = await ArtisanProfile.findOne({ user: req.user.userId });
      if (!artisanProfile || !product.artisan.equals(artisanProfile._id)) {
        throw createError(403, 'You do not own this product.');
      }
    }
    const updates = req.body;
    delete updates.artisan;
    delete updates.rating;
    delete updates.reviewCount;
    delete updates.salesCount;
    delete updates.viewCount;
    const updated = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    return res.json({ message: 'Product updated.', product: updated });
  } catch (err) {
    next(err);
  }
}
export async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) throw createError(404, 'Product not found.');
    if (req.user.role !== 'admin') {
      const artisanProfile = await ArtisanProfile.findOne({ user: req.user.userId });
      if (!artisanProfile || !product.artisan.equals(artisanProfile._id)) {
        throw createError(403, 'You do not own this product.');
      }
    }
    await Product.findByIdAndUpdate(req.params.id, { isActive: false });
    return res.json({ message: 'Product deactivated.' });
  } catch (err) {
    next(err);
  }
}
export async function toggleFeatured(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) throw createError(404, 'Product not found.');
    product.isFeatured = !product.isFeatured;
    await product.save();
    return res.json({
      message: `Product ${product.isFeatured ? 'featured' : 'unfeatured'}.`,
      isFeatured: product.isFeatured,
    });
  } catch (err) {
    next(err);
  }
}
