import { Router } from 'express';
import { verifyToken, requireRole } from '../middleware/auth.middleware.js';
import * as collectionsController from '../controllers/craftCollections.controller.js';
const router = Router();

router.get('/', collectionsController.getCollections);
router.get('/:id', collectionsController.getCollection);
router.post(
    '/',
    verifyToken,
    requireRole('artisan', 'admin'),
    collectionsController.createCollection
);
router.put(
    '/:id',
    verifyToken,
    requireRole('artisan', 'admin'),
    collectionsController.updateCollection
);
router.delete(
    '/:id',
    verifyToken,
    requireRole('artisan', 'admin'),
    collectionsController.deleteCollection
);

router.post(
    '/:id/products/:productId',
    verifyToken,
    requireRole('artisan'),
    collectionsController.addProductToCollection
);
router.delete(
    '/:id/products/:productId',
    verifyToken,
    requireRole('artisan'),
    collectionsController.removeProductFromCollection
);

export default router;