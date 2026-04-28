import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import * as paymentController from '../controllers/payment.controller.js';

const router = Router();
router.post('/create-intent', verifyToken, paymentController.createPaymentIntent);
router.post('/webhook', paymentController.stripeWebhook);

export default router;
