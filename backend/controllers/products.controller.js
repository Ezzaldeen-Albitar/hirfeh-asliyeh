import mongoose from 'mongoose';
import Product from '../models/Product.js';
import ArtisanProfile from '../models/ArtisanProfile.js';
import OriginStory from '../models/OriginStory.js';
import { createError } from '../middleware/error.middleware.js';

const CATEGORY_ALIASES = {
  'السيراميك': 'السيراميك',
  'فخار وخزف': 'السيراميك',
  السيراميك: 'السيراميك',
  الفخار: 'السيراميك',
  Pottery: 'السيراميك',
  'تطريز ونسيج': 'تطريز ونسيج',
  التطريز: 'تطريز ونسيج',
  النسيج: 'تطريز ونسيج',
  Embroidery: 'تطريز ونسيج',
  'نجارة وخشب': 'نجارة وخشب',
  الخشب: 'نجارة وخشب',
  'زجاج مزخرف': 'زجاج مزخرف',
  الزجاج: 'زجاج مزخرف',
  جلديات: 'جلديات',
  'مجوهرات يدوية': 'مجوهرات يدوية',
  المجوهرات: 'مجوهرات يدوية',
  فسيفساء: 'فسيفساء',
  Mosaic: 'فسيفساء',
  'صابون وعطور': 'صابون وعطور',
  'سلال وقش': 'سلال وقش',
  أخرى: 'أخرى',
};

const CATEGORY_QUERY_VALUES = {
  'السيراميك': ['السيراميك', 'فخار وخزف', 'Pottery'],
  'تطريز ونسيج': ['تطريز ونسيج', 'Embroidery'],
  'نجارة وخشب': ['نجارة وخشب'],
  'زجاج مزخرف': ['زجاج مزخرف'],
  جلديات: ['جلديات'],
  'مجوهرات يدوية': ['مجوهرات يدوية'],
  فسيفساء: ['فسيفساء', 'Mosaic'],
  'صابون وعطور': ['صابون وعطور'],
  'سلال وقش': ['سلال وقش'],
  أخرى: ['أخرى'],
};

const REGION_ALIASES = {
  'عمّان': 'عمّان',
  عمان: 'عمّان',
  Amman: 'عمّان',
  إربد: 'إربد',
  اربد: 'إربد',
  Irbid: 'إربد',
  الكرك: 'الكرك',
  Karak: 'الكرك',
  مأدبا: 'مأدبا',
  مادبا: 'مأدبا',
  Madaba: 'مأدبا',
  العقبة: 'العقبة',
  Aqaba: 'العقبة',
  الزرقاء: 'الزرقاء',
  Zarqa: 'الزرقاء',
  البلقاء: 'البلقاء',
  Balqa: 'البلقاء',
  السلط: 'السلط',
  Salt: 'السلط',
  جرش: 'جرش',
  Jerash: 'جرش',
  عجلون: 'عجلون',
  Ajloun: 'عجلون',
  معان: 'معان',
  Maan: 'معان',
  الطفيلة: 'الطفيلة',
  Tafila: 'الطفيلة',
};

function normalizeCategory(value) {
  if (!value) return '';
  return CATEGORY_ALIASES[value] || value;
}

function buildCategoryFilter(value) {
  const normalized = normalizeCategory(value);
  if (!normalized) return undefined;

  const queryValues = CATEGORY_QUERY_VALUES[normalized] || [normalized];
  return queryValues.length === 1 ? queryValues[0] : { $in: queryValues };
}

function normalizeRegion(value) {
  if (!value) return '';
  return REGION_ALIASES[value] || value;
}

export async function getProducts(req, res, next) {
  try {
    const {
      page = 1,
      limit = 12,
      category: rawCategory,
      craftType,
      minPrice,
      maxPrice,
      type,
      region: rawRegion,
      governorate,
      search,
      artisan,
      collection,
      sort = 'newest',
      featured,
      verified,
    } = req.query;

    const categoryFilter = buildCategoryFilter(rawCategory || craftType);
    const region = normalizeRegion(rawRegion || governorate);
    const filter = { isActive: true };

    if (categoryFilter) filter.category = categoryFilter;
    if (type) filter.productType = type;
    if (artisan) filter.artisan = artisan;
    if (collection) filter.collectionId = collection;
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
      newest: { createdAt: -1, _id: -1 },
      oldest: { createdAt: 1, _id: 1 },
      'price-asc': { price: 1, createdAt: -1, _id: -1 },
      price_asc: { price: 1, createdAt: -1, _id: -1 },
      'price-desc': { price: -1, createdAt: -1, _id: -1 },
      price_desc: { price: -1, createdAt: -1, _id: -1 },
      rating: { rating: -1, reviewCount: -1, createdAt: -1, _id: -1 },
      popular: { salesCount: -1, viewCount: -1, createdAt: -1, _id: -1 },
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
        .populate('collectionId', 'name nameAr')
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
      .populate('originStory')
      .populate('collectionId', 'name nameAr description coverImage');

    if (!product) throw createError(404, 'Product not found.');

    Product.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } }).exec();
    return res.json({ product });
  } catch (err) {
    next(err);
  }
}

export async function getMyProducts(req, res, next) {
  try {
    const artisanProfile = await ArtisanProfile.findOne({ user: req.user.userId });
    if (!artisanProfile) {
      return res.json({
        products: [],
        pagination: { total: 0, page: 1, limit: parseInt(req.query.limit || 50), totalPages: 0, hasNext: false },
      });
    }

    req.query = { ...req.query, artisan: artisanProfile._id.toString() };
    return getProducts(req, res, next);
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req, res, next) {
  try {
    const artisanProfile = await ArtisanProfile.findOne({ user: req.user.userId });
    if (!artisanProfile) {
      throw createError(403, 'Artisan profile is incomplete. Open artisan dashboard settings and complete your profile first.');
    }

    const {
      title,
      description,
      price,
      category,
      craftType,
      productType,
      stock,
      leadTimeDays,
      materials,
      dimensions,
      weight,
      allowsCustomization,
      customizationOptions,
      tags,
      images,
      thumbnailIndex,
      collection,
      originRegion,
      originVillage,
      originLat,
      originLng,
      craftingProcess,
      materialsSource,
      culturalSignificance,
      artisanPersonalNote,
      estimatedCraftingTime,
      generationsTaught,
    } = req.body;

    const productData = {
      artisan: artisanProfile._id,
      title,
      description,
      price: parseFloat(price),
      category: normalizeCategory(category || craftType),
      productType,
      images: Array.isArray(images) ? images : [images],
      thumbnailIndex: thumbnailIndex || 0,
      tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
      allowsCustomization: allowsCustomization === 'true' || allowsCustomization === true,
      customizationOptions,
      materials: Array.isArray(materials) ? materials : (materials ? [materials] : []),
      dimensions,
      weight,
      ...(collection ? { collectionId: collection } : {}),
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

    const updates = { ...req.body };
    if (updates.category || updates.craftType) {
      updates.category = normalizeCategory(updates.category || updates.craftType);
    }

    delete updates.artisan;
    delete updates.craftType;
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

    await Product.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Product deleted successfully.' });
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

export async function getFeaturedProducts(req, res, next) {
  try {
    const { limit = 8 } = req.query;
    const products = await Product.find({ isActive: true, isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('artisan', 'craftName region profileImage isVerified')
      .lean();

    return res.json({ products });
  } catch (err) {
    next(err);
  }
}
