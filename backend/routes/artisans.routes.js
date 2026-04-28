import { Router } from 'express';
import { verifyToken, requireRole } from '../middleware/auth.middleware.js';
import * as artisansController from '../controllers/artisans.controller.js';

const router = Router();
router.get('/', artisansController.getArtisans);
router.get('/:id', artisansController.getArtisan);
router.post('/apply', verifyToken, artisansController.applyAsArtisan);
router.put('/:id', verifyToken, artisansController.updateArtisan);
router.get('/:id/stats', verifyToken, artisansController.getArtisanStats);
router.put('/:id/verify', verifyToken, requireRole('admin'), artisansController.verifyArtisan);
router.post('/:id/badges', verifyToken, requireRole('admin'), artisansController.assignBadge);

export default router;
