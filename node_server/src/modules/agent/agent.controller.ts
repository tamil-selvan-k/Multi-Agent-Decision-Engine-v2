import { Request } from 'express';
import { z } from 'zod';
import { AgentService } from './agent.service';
import { asyncHandler } from '@utils/asyncHandler';
import { ApiResponse } from '@utils/ApiResponse';
import { AppError } from '@utils/AppError';
import { AuthenticatedRequest } from '@appTypes/auth.types';

const createAgentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.string().optional(),
  config: z.record(z.string(), z.any()).optional(),
});

const updateAgentSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  type: z.string().optional(),
  config: z.record(z.string(), z.any()).optional(),
});

export class AgentController {
  public static createAgent = asyncHandler(async (req: Request) => {
    const parseResult = createAgentSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new AppError('Invalid agent data', 400, parseResult.error.issues);
    }

    const userId = (req as AuthenticatedRequest).user?.userId;
    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const agent = await AgentService.createAgent({
      ...parseResult.data,
      createdBy: userId,
    });
    return new ApiResponse(201, agent, 'Agent created successfully');
  });

  public static getAgents = asyncHandler(async (req: Request) => {
    const agents = await AgentService.getAgents(req.query);
    return new ApiResponse(200, agents, 'Agents retrieved successfully');
  });

  public static getAgentById = asyncHandler(async (req: Request) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      throw new AppError('Agent ID is required', 400);
    }
    const agent = await AgentService.getAgentById(id);
    if (!agent) {
      throw new AppError('Agent not found', 404);
    }
    return new ApiResponse(200, agent, 'Agent retrieved successfully');
  });

  public static updateAgent = asyncHandler(async (req: Request) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      throw new AppError('Agent ID is required', 400);
    }
    const parseResult = updateAgentSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new AppError('Invalid update data', 400, parseResult.error.issues);
    }
    const updatedAgent = await AgentService.updateAgent(id, parseResult.data);
    if (!updatedAgent) {
      throw new AppError('Agent not found', 404);
    }
    return new ApiResponse(200, updatedAgent, 'Agent updated successfully');
  });

  public static deleteAgent = asyncHandler(async (req: Request) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      throw new AppError('Agent ID is required', 400);
    }
    const deleted = await AgentService.deleteAgent(id);
    if (!deleted) {
      throw new AppError('Agent not found', 404);
    }
    return new ApiResponse(200, { success: true }, 'Agent deleted successfully');
  });
}
