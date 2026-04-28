import cloudinary from '../config/cloudinary.js';
import { createError } from '../middleware/error.middleware.js';
async function uploadBufferToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: 'souqjo',
      resource_type: 'image',
      transformation: [
        { quality: 'auto', fetch_format: 'auto' },
        { width: 1200, crop: 'limit' },
      ],
      ...options,
    };
    const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
    uploadStream.end(buffer);
  });
}
export async function uploadImage(req, res, next) {
  try {
    if (!req.file) throw createError(400, 'No image file provided.');
    const folder = req.body.folder || 'products'; 
    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder: `souqjo/${folder}`,
    });
    return res.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (err) {
    next(err);
  }
}
export async function uploadMultipleImages(req, res, next) {
  try {
    if (!req.files || req.files.length === 0) {
      throw createError(400, 'No image files provided.');
    }
    const folder = req.body.folder || 'products';
    const uploadPromises = req.files.map(file =>
      uploadBufferToCloudinary(file.buffer, { folder: `souqjo/${folder}` })
    );
    const results = await Promise.all(uploadPromises);
    return res.json({
      images: results.map(r => ({
        url: r.secure_url,
        publicId: r.public_id,
      })),
    });
  } catch (err) {
    next(err);
  }
}
export async function deleteImage(req, res, next) {
  try {
    const { publicId } = req.body;
    if (!publicId) throw createError(400, 'Public ID is required.');
    await cloudinary.uploader.destroy(publicId);
    return res.json({ message: 'Image deleted.' });
  } catch (err) {
    next(err);
  }
}
