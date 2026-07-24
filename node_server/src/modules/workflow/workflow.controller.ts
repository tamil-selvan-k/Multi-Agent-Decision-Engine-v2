import { Request } from 'express';
import { z } from 'zod';
import { WorkflowService } from './workflow.service';
import { asyncHandler } from '@utils/asyncHandler';
import { ApiResponse } from '@utils/ApiResponse';
import { AppError } from '@utils/AppError';
import { AuthenticatedRequest } from '@appTypes/auth.types';

const createWorkflowSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  definition: z.record(z.string(), z.any()).optional(),
});

const updateWorkflowSchema = z.object({
  definition: z.record(z.string(), z.any()).optional(),
  status: z.string().optional(),
});

export class WorkflowController {
  public static createWorkflow = asyncHandler(async (req: Request) => {
    const parseResult = createWorkflowSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new AppError('Invalid workflow data', 400, parseResult.error.issues);
    }
    const userId = (req as AuthenticatedRequest).user?.userId;
    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }
    const workflow = await WorkflowService.createWorkflow({ ...parseResult.data, createdBy: userId });
    return new ApiResponse(201, workflow, 'Workflow created successfully');
  });

  public static getWorkflows = asyncHandler(async (req: Request) => {
    const workflows = await WorkflowService.getWorkflows(req.query);
    return new ApiResponse(200, workflows, 'Workflows retrieved successfully');
  });

  public static getWorkflowById = asyncHandler(async (req: Request) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) throw new AppError('Workflow ID is required', 400);
    const workflow = await WorkflowService.getWorkflowById(id);
    if (!workflow) throw new AppError('Workflow not found', 404);
    return new ApiResponse(200, workflow, 'Workflow retrieved successfully');
  });

  public static updateWorkflow = asyncHandler(async (req: Request) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) throw new AppError('Workflow ID is required', 400);
    const parseResult = updateWorkflowSchema.safeParse(req.body);
    if (!parseResult.success) throw new AppError('Invalid update data', 400, parseResult.error.issues);
    const updated = await WorkflowService.updateWorkflow(id, parseResult.data);
    if (!updated) throw new AppError('Workflow not found', 404);
    return new ApiResponse(200, updated, 'Workflow updated successfully');
  });

  public static deleteWorkflow = asyncHandler(async (req: Request) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) throw new AppError('Workflow ID is required', 400);
    const deleted = await WorkflowService.deleteWorkflow(id);
    if (!deleted) throw new AppError('Workflow not found', 404);
    return new ApiResponse(200, { success: true }, 'Workflow deleted successfully');
  });
}
