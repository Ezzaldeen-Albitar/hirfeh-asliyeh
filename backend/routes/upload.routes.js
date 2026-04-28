import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { handleUploadSingle, handleUploadMultiple } from '../middleware/upload.middleware.js';
import * as uploadController from '../controllers/upload.controller.js';

const router = Router();
router.post('/image', verifyToken, handleUploadSingle, uploadController.uploadImage);
router.post('/multiple', verifyToken, handleUploadMultiple, uploadController.uploadMultipleImages);
router.delete('/image', verifyToken, uploadController.deleteImage);

export default router;
