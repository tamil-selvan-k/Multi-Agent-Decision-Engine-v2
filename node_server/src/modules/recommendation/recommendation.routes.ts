import { Router } from 'express';
import { RecommendationController } from './recommendation.controller';
import { authenticateJWT } from '@middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateJWT);

router.post('/', RecommendationController.createRecommendation);
router.get('/', RecommendationController.getRecommendations);
router.get('/:id', RecommendationController.getRecommendationById);
router.patch('/:id', RecommendationController.updateRecommendation);
router.delete('/:id', RecommendationController.deleteRecommendation);

export default router;
