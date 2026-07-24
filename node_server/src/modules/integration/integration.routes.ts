import { Router } from 'express';
import { IntegrationController } from './integration.controller';
import { authenticateJWT } from '@middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateJWT);

router.get('/', IntegrationController.getIntegrations);
router.patch('/:id', IntegrationController.toggleIntegration);

export default router;
