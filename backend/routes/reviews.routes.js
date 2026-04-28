import { Router } from 'express';
import { verifyToken, requireRole } from '../middleware/auth.middleware.js';
import * as reviewsController from '../controllers/reviews.controller.js';

const router = Router();
router.post('/', verifyToken, requireRole('customer'), reviewsController.createReview);
router.get('/product/:productId', reviewsController.getProductReviews);
router.post('/:id/reply', verifyToken, requireRole('artisan'), reviewsController.replyToReview);
router.delete('/:id', verifyToken, requireRole('admin'), reviewsController.deleteReview);

export default router;
