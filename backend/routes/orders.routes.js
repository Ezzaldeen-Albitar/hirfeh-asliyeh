import { Router } from 'express';
import { verifyToken, requireRole } from '../middleware/auth.middleware.js';
import * as ordersController from '../controllers/orders.controller.js';

const router = Router();
const requireCustomerOrder = (req, res, next) => {
  if (req.user.role !== 'customer') {
    return res.status(403).json({ message: 'إنشاء الطلبات متاح للعملاء فقط.' });
  }
  next();
};

router.post('/', verifyToken, requireCustomerOrder, ordersController.createOrder);
router.get('/', verifyToken, ordersController.getOrders);
router.get('/artisan', verifyToken, requireRole('artisan'), ordersController.getOrders);
router.get('/:id', verifyToken, ordersController.getOrder);
router.patch('/:id/status', verifyToken, requireRole('artisan', 'admin'), ordersController.updateOrderStatus);
router.patch('/:id/cancel', verifyToken, ordersController.cancelOrder);
router.put('/:id/status', verifyToken, requireRole('artisan', 'admin'), ordersController.updateOrderStatus);
router.put('/:id/cancel', verifyToken, ordersController.cancelOrder);

export default router;
