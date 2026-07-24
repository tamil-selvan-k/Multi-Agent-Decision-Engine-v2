import { Router } from 'express';
import { IntelligenceController } from './intelligence.controller';
import { authenticateJWT } from '@middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/sales', IntelligenceController.getSalesIntelligence);
router.get('/inventory', IntelligenceController.getInventoryIntelligence);
router.get('/finance', IntelligenceController.getFinanceIntelligence);
router.get('/logistics', IntelligenceController.getLogisticsIntelligence);

export default router;
