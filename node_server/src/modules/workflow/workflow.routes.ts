import { Router } from 'express';
import { WorkflowController } from './workflow.controller';
import { authenticateJWT, requirePermission } from '@middleware/auth.middleware';
import { PermissionEnum } from '@appTypes/rbac.enum';

const router = Router();

// All routes require authentication
router.use(authenticateJWT);

// Workflow management (requires appropriate permissions)
router.use(requirePermission(PermissionEnum.MANAGE_USERS)); // Adjust as needed

router.post('/', WorkflowController.createWorkflow);
router.get('/', WorkflowController.getWorkflows);
router.get('/:id', WorkflowController.getWorkflowById);
router.patch('/:id', WorkflowController.updateWorkflow);
router.delete('/:id', WorkflowController.deleteWorkflow);

export default router;
