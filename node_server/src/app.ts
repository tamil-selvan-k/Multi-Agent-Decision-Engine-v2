import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { requestLogger } from '@middleware/logger';
import { errorHandler } from '@middleware/errorHandler';
import authRoutes from '@modules/auth/auth.routes';
import usersRoutes from '@modules/users/users.routes';
import dashboardRoutes from '@modules/dashboard/dashboard.routes';
import decisionRoutes from '@modules/decision/decision.routes';
import approvalRoutes from '@modules/approval/approval.routes';
import simulationRoutes from '@modules/simulation/simulation.routes';
import agentRoutes from '@modules/agent/agent.routes';
import workflowRoutes from '@modules/workflow/workflow.routes';
import recommendationRoutes from '@modules/recommendation/recommendation.routes';
import knowledgeRoutes from '@modules/knowledge/knowledge.routes';
import integrationRoutes from '@modules/integration/integration.routes';
import chatRoutes from '@modules/chat/chat.routes';
import auditLogsRoutes from '@modules/audit-logs/audit-logs.routes';
import intelligenceRoutes from '@modules/intelligence/intelligence.routes';
import { UserController } from '@modules/users/users.controller';
import { authenticateJWT } from '@middleware/auth.middleware';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Request logging
app.use(requestLogger);

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount Module Routes (internal / API versioned)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/decision', decisionRoutes);
app.use('/api/v1/approval', approvalRoutes);
app.use('/api/v1/simulation', simulationRoutes);

// Mount Frontend-facing routes (unversioned under /api prefix)
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/decision', decisionRoutes);
app.use('/api/approval', approvalRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/audit-logs', auditLogsRoutes);
app.use('/api/intelligence', intelligenceRoutes);
app.get('/api/me', authenticateJWT, UserController.getMe);


// Error Handling (Must be last)
app.use(errorHandler);

export default app;