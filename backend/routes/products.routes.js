import { Router } from 'express';
import { verifyToken, requireRole } from '../middleware/auth.middleware.js';
import * as productsController from '../controllers/products.controller.js';

const router = Router();

// ✅ Static routes MUST come before dynamic /:id routes
router.get('/featured', productsController.getFeaturedProducts);
router.get('/mine', verifyToken, requireRole('artisan', 'admin'), productsController.getMyProducts);
router.get('/', productsController.getProducts);
router.get('/:id', productsController.getProduct);
router.post('/', verifyToken, requireRole('artisan', 'admin'), productsController.createProduct);
router.put('/:id', verifyToken, requireRole('artisan', 'admin'), productsController.updateProduct);
router.delete('/:id', verifyToken, requireRole('artisan', 'admin'), productsController.deleteProduct);
router.put('/:id/feature', verifyToken, requireRole('admin'), productsController.toggleFeatured);

export default router;
