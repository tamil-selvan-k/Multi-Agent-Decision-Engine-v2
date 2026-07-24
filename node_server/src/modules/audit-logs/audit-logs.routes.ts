import { Router } from 'express';
import { AuditLogsController } from './audit-logs.controller';
import { authenticateJWT } from '@middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);
router.get('/', AuditLogsController.getAuditLogs);

export default router;
