import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import * as notificationsController from '../controllers/notifications.controller.js';

const router = Router();

router.get('/', verifyToken, notificationsController.getNotifications);
router.put('/read-all', verifyToken, notificationsController.markAllAsRead);
router.put('/:id/read', verifyToken, notificationsController.markAsRead);

export default router;
