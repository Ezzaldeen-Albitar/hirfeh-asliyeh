import { Router } from 'express';
import { verifyToken, requireRole } from '../middleware/auth.middleware.js';
import * as customizationsController from '../controllers/customizations.controller.js';

const router = Router();

router.post('/', verifyToken, requireRole('customer'), customizationsController.createRequest);
router.get('/', verifyToken, customizationsController.getRequests);
router.get('/:id', verifyToken, customizationsController.getRequest);
router.put('/:id/quote', verifyToken, requireRole('artisan'), customizationsController.sendQuote);
router.put('/:id/accept', verifyToken, requireRole('customer'), customizationsController.acceptQuote);
router.post('/:id/message', verifyToken, customizationsController.sendMessage);
router.put('/:id/complete', verifyToken, requireRole('artisan'), customizationsController.completeRequest);

export default router;
