import { v2 as cloudinary } from 'cloudinary';
import { AppError } from '../utils/AppError.js';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadSingleImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(new AppError('Please upload an image', 400));
        }
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'hirfeh-asliyeh/uploads',
            resource_type: 'auto'
        });
        res.status(200).json({
            status: 'success',
            url: result.secure_url,
            public_id: result.public_id
        });
    } catch (error) {
        next(error);
    }
};

export const uploadMultipleImages = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return next(new AppError('Please upload at least one image', 400));
        }
        const uploadPromises = req.files.map(file => {
            const b64 = Buffer.from(file.buffer).toString('base64');
            const dataURI = `data:${file.mimetype};base64,${b64}`;
            return cloudinary.uploader.upload(dataURI, {
                folder: 'hirfeh-asliyeh/products'
            });
        });
        const results = await Promise.all(uploadPromises);
        res.status(200).json({
            status: 'success',
            data: results.map(img => ({
                url: img.secure_url,
                public_id: img.public_id
            }))
        });
    } catch (error) {
        next(error);
    }
};

export const deleteImage = async (req, res, next) => {
    try {
        const { public_id } = req.body;
        if (!public_id) {
            return next(new AppError('Public ID is required to delete an image', 400));
        }
        const result = await cloudinary.uploader.destroy(public_id);
        res.status(200).json({
            status: 'success',
            result
        });
    } catch (error) {
        next(error);
    }
};