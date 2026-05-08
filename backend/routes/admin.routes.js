import { Router } from 'express';
import { verifyToken, requireRole } from '../middleware/auth.middleware.js';
import * as adminController from '../controllers/admin.controller.js';
import { getOrders } from '../controllers/orders.controller.js';

const router = Router();

// All routes here require admin role
router.use(verifyToken, requireRole('admin'));

// Dashboard stats
router.get('/stats', adminController.getDashboardStats);
router.get('/dashboard', adminController.getDashboardStats);

// User management
router.get('/users', adminController.getUsers);
router.put('/users/:id/ban', adminController.toggleBanUser);
router.patch('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

// Artisan management
router.get('/artisans/pending', adminController.getPendingArtisans);

// التحقق من الحرفيين - تم دعم PUT و PATCH لضمان التوافق مع الواجهة الأمامية
router.put('/artisans/:id/verify', adminController.verifyArtisan);
router.patch('/artisans/:id/verify', adminController.verifyArtisan);

// Product management
router.get('/products', adminController.getAdminProducts);

// Order management
router.get('/orders', getOrders);

// Badge management
router.get('/badges', adminController.getBadges);
router.post('/badges', adminController.createBadge);

export default router;
