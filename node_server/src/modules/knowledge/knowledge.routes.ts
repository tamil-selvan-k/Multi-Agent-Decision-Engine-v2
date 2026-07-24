import { Router } from 'express';
import { KnowledgeController } from './knowledge.controller';
import { authenticateJWT } from '@middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateJWT);

// Knowledge Categories
router.post('/categories', KnowledgeController.createCategory);
router.get('/categories', KnowledgeController.getCategories);

// Knowledge Documents
router.post('/documents', KnowledgeController.createDocument);
router.get('/documents', KnowledgeController.getDocuments);
router.get('/documents/:id', KnowledgeController.getDocumentById);

export default router;
