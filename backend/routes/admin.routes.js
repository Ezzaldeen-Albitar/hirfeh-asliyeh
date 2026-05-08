import { Router } from 'express';
import { verifyToken, requireRole } from '../middleware/auth.middleware.js';
import * as adminController from '../controllers/admin.controller.js';
import { getOrders } from '../controllers/orders.controller.js';

const router = Router();
router.use(verifyToken, requireRole('admin'));

router.get('/stats', adminController.getDashboardStats);
router.get('/dashboard', adminController.getDashboardStats);

router.get('/users', adminController.getUsers);
router.put('/users/:id/ban', adminController.toggleBanUser);
router.patch('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);
router.get('/artisans/pending', adminController.getPendingArtisans);

// التحقق من الحرفيين - تم اعتماد PATCH لتعديل الحالة
router.patch('/artisans/:id/verify', adminController.verifyArtisan);

router.get('/products', adminController.getAdminProducts);
router.get('/orders', getOrders);
router.get('/badges', adminController.getBadges);
router.post('/badges', adminController.createBadge);

export default router;