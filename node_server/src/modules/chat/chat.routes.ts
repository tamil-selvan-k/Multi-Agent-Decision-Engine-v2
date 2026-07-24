import { Router } from 'express';
import { ChatController } from './chat.controller';
import { authenticateJWT } from '@middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);
router.get('/messages', ChatController.getMessages);
router.post('/messages', ChatController.sendMessage);

export default router;
