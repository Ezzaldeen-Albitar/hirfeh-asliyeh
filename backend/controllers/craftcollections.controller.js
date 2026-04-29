import CraftCollection from '../models/CraftCollection.js';
import ArtisanProfile from '../models/ArtisanProfile.js';
import Product from '../models/Product.js';
import { createError } from '../middleware/error.middleware.js';

async function resolveArtisan(userId) {
    const profile = await ArtisanProfile.findOne({ user: userId });
    if (!profile) throw createError(404, 'Artisan profile not found.');
    return profile;
}

export async function getCollections(req, res, next) {
    try {
        const { artisan, page = 1, limit = 20 } = req.query;
        const filter = { isActive: true };
        if (artisan) filter.artisan = artisan;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [collections, total] = await Promise.all([
            CraftCollection.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('artisan', 'craftName region profileImage isVerified')
                .lean(),
            CraftCollection.countDocuments(filter),
        ]);
        return res.json({
            collections,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit)),
                hasNext: skip + collections.length < total,
            },
        });
    } catch (err) {
        next(err);
    }
}

export async function getCollection(req, res, next) {
    try {
        const collection = await CraftCollection.findOne({
            _id: req.params.id,
            isActive: true,
        }).populate('artisan', 'craftName region profileImage isVerified rating badges');
        if (!collection) throw createError(404, 'Collection not found.');
        const products = await Product.find({
            collection: collection._id,
            isActive: true,
        })
            .sort({ createdAt: -1 })
            .populate('originStory', 'certificateNumber origin.region')
            .lean();
        return res.json({ collection, products });
    } catch (err) {
        next(err);
    }
}

export async function createCollection(req, res, next) {
    try {
        const artisanProfile = await resolveArtisan(req.user.userId);
        const { name, nameAr, description, coverImage } = req.body;
        const collection = await CraftCollection.create({
            artisan: artisanProfile._id,
            name,
            nameAr,
            description,
            coverImage,
        });
        return res.status(201).json({ message: 'Collection created.', collection });
    } catch (err) {
        next(err);
    }
}
export async function updateCollection(req, res, next) {
    try {
        const collection = await CraftCollection.findById(req.params.id);
        if (!collection) throw createError(404, 'Collection not found.');
        if (req.user.role !== 'admin') {
            const artisanProfile = await resolveArtisan(req.user.userId);
            if (!collection.artisan.equals(artisanProfile._id)) {
                throw createError(403, 'You do not own this collection.');
            }
        }
        const { name, nameAr, description, coverImage } = req.body;
        if (name !== undefined) collection.name = name;
        if (nameAr !== undefined) collection.nameAr = nameAr;
        if (description !== undefined) collection.description = description;
        if (coverImage !== undefined) collection.coverImage = coverImage;
        await collection.save();
        return res.json({ message: 'Collection updated.', collection });
    } catch (err) {
        next(err);
    }
}
export async function deleteCollection(req, res, next) {
    try {
        const collection = await CraftCollection.findById(req.params.id);
        if (!collection) throw createError(404, 'Collection not found.');
        if (req.user.role !== 'admin') {
            const artisanProfile = await resolveArtisan(req.user.userId);
            if (!collection.artisan.equals(artisanProfile._id)) {
                throw createError(403, 'You do not own this collection.');
            }
        }
        await Product.updateMany({ collection: collection._id }, { $unset: { collection: '' } });
        collection.isActive = false;
        await collection.save();
        return res.json({ message: 'Collection deleted.' });
    } catch (err) {
        next(err);
    }
}

export async function addProductToCollection(req, res, next) {
    try {
        const collection = await CraftCollection.findOne({
            _id: req.params.id,
            isActive: true,
        });
        if (!collection) throw createError(404, 'Collection not found.');
        const artisanProfile = await resolveArtisan(req.user.userId);
        if (!collection.artisan.equals(artisanProfile._id)) {
            throw createError(403, 'You do not own this collection.');
        }
        const product = await Product.findOne({
            _id: req.params.productId,
            artisan: artisanProfile._id,
            isActive: true,
        });
        if (!product) throw createError(404, 'Product not found or not yours.');

        if (product.collection && product.collection.equals(collection._id)) {
            throw createError(409, 'Product is already in this collection.');
        }
        if (product.collection) {
            await CraftCollection.findByIdAndUpdate(product.collection, {
                $inc: { productCount: -1 },
            });
        }
        product.collection = collection._id;
        await product.save();
        await CraftCollection.findByIdAndUpdate(collection._id, {
            $inc: { productCount: 1 },
        });
        return res.json({ message: 'Product added to collection.' });
    } catch (err) {
        next(err);
    }
}

export async function removeProductFromCollection(req, res, next) {
    try {
        const collection = await CraftCollection.findOne({
            _id: req.params.id,
            isActive: true,
        });
        if (!collection) throw createError(404, 'Collection not found.');
        const artisanProfile = await resolveArtisan(req.user.userId);
        if (!collection.artisan.equals(artisanProfile._id)) {
            throw createError(403, 'You do not own this collection.');
        }
        const product = await Product.findOne({
            _id: req.params.productId,
            artisan: artisanProfile._id,
            collection: collection._id,
        });
        if (!product) throw createError(404, 'Product not found in this collection.');
        product.collection = undefined;
        await product.save();
        await CraftCollection.findByIdAndUpdate(collection._id, {
            $inc: { productCount: -1 },
        });
        return res.json({ message: 'Product removed from collection.' });
    } catch (err) {
        next(err);
    }
}