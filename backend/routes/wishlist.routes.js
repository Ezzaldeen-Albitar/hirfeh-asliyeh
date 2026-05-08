import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import * as wishlistController from '../controllers/wishlist.controller.js';

const router = Router();

router.get('/', verifyToken, wishlistController.getWishlist);
router.post('/', verifyToken, wishlistController.addToWishlist);
router.delete('/:productId', verifyToken, wishlistController.removeFromWishlist);

export default router;
