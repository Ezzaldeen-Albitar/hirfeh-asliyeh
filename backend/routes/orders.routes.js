import { Router } from 'express';
import { verifyToken, requireRole } from '../middleware/auth.middleware.js';
import * as ordersController from '../controllers/orders.controller.js';

const router = Router();

router.post('/', verifyToken, requireRole('customer'), ordersController.createOrder);
router.get('/', verifyToken, ordersController.getOrders);
router.get('/:id', verifyToken, ordersController.getOrder);
router.put('/:id/status', verifyToken, requireRole('artisan', 'admin'), ordersController.updateOrderStatus);
router.put('/:id/cancel', verifyToken, ordersController.cancelOrder);

export default router;
