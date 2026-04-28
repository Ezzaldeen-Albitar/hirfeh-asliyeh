import { Router } from 'express';
import { verifyToken, requireRole } from '../middleware/auth.middleware.js';
import * as originStoriesController from '../controllers/originStories.controller.js';

const router = Router();

router.get('/product/:productId', originStoriesController.getByProduct);
router.post('/', verifyToken, requireRole('artisan'), originStoriesController.createStory);
router.put('/:id', verifyToken, requireRole('artisan', 'admin'), originStoriesController.updateStory);

export default router;
