import { Router } from 'express';
import { verifyToken, requireRole } from '../middleware/auth.middleware.js';
import * as adminController from '../controllers/admin.controller.js';
import { getOrders } from '../controllers/orders.controller.js';

const router = Router();
router.use(verifyToken, requireRole('admin'));

// Stats — support both /stats (frontend) and /dashboard (legacy)
router.get('/stats', adminController.getDashboardStats);
router.get('/dashboard', adminController.getDashboardStats);

router.get('/users', adminController.getUsers);
router.put('/users/:id/ban', adminController.toggleBanUser);
router.get('/artisans/pending', adminController.getPendingArtisans);
router.get('/products', adminController.getAdminProducts);
router.get('/orders', getOrders);
router.get('/badges', adminController.getBadges);
router.post('/badges', adminController.createBadge);

export default router;
