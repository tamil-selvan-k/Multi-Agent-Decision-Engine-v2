import { Router } from 'express';
import { AgentController } from './agent.controller';
import { authenticateJWT, requirePermission } from '@middleware/auth.middleware';
import { PermissionEnum } from '@appTypes/rbac.enum';

const router = Router();

// All routes require authentication
router.use(authenticateJWT);

// Agent management (requires appropriate permissions)
// For simplicity, we'll require MANAGE_USERS or a custom permission; but we don't have one yet.
// We'll use MANAGE_USERS for now, or we can create a new permission later.
// Let's require MANAGE_USERS for agent CRUD operations.
router.use(requirePermission(PermissionEnum.MANAGE_USERS));

router.post('/', AgentController.createAgent);
router.get('/', AgentController.getAgents);
router.get('/:id', AgentController.getAgentById);
router.patch('/:id', AgentController.updateAgent);
router.delete('/:id', AgentController.deleteAgent);

export default router;
