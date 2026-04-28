import { Router } from 'express';
import { verifyToken, requireRole } from '../middleware/auth.middleware.js';
import * as workshopsController from '../controllers/workshops.controller.js';

const router = Router();
router.get('/', workshopsController.getWorkshops);
router.get('/:id', workshopsController.getWorkshop);
router.post('/', verifyToken, requireRole('artisan'), workshopsController.createWorkshop);
router.put('/:id', verifyToken, requireRole('artisan', 'admin'), workshopsController.updateWorkshop);
router.delete('/:id', verifyToken, requireRole('artisan', 'admin'), workshopsController.deleteWorkshop);
router.post('/:id/book', verifyToken, requireRole('customer'), workshopsController.bookWorkshop);
router.get('/:id/bookings', verifyToken, requireRole('artisan', 'admin'), workshopsController.getSessionBookings);

export default router;
