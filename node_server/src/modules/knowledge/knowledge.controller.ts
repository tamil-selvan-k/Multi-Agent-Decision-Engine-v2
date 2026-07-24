import { Request } from 'express';
import { z } from 'zod';
import { KnowledgeService } from './knowledge.service';
import { asyncHandler } from '@utils/asyncHandler';
import { ApiResponse } from '@utils/ApiResponse';
import { AppError } from '@utils/AppError';
import { AuthenticatedRequest } from '@appTypes/auth.types';

const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

const createDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().optional(),
  categoryId: z.string(),
});

export class KnowledgeController {
  public static createCategory = asyncHandler(async (req: Request) => {
    const parseResult = createCategorySchema.safeParse(req.body);
    if (!parseResult.success) throw new AppError('Invalid category data', 400, parseResult.error.issues);
    const userId = (req as AuthenticatedRequest).user?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);
    const category = await KnowledgeService.createCategory({ ...parseResult.data, createdBy: userId });
    return new ApiResponse(201, category, 'Knowledge category created successfully');
  });

  public static getCategories = asyncHandler(async () => {
    const categories = await KnowledgeService.getCategories();
    return new ApiResponse(200, categories, 'Knowledge categories retrieved successfully');
  });

  public static createDocument = asyncHandler(async (req: Request) => {
    const parseResult = createDocumentSchema.safeParse(req.body);
    if (!parseResult.success) throw new AppError('Invalid document data', 400, parseResult.error.issues);
    const userId = (req as AuthenticatedRequest).user?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);
    const doc = await KnowledgeService.createDocument({ ...parseResult.data, createdBy: userId });
    return new ApiResponse(201, doc, 'Knowledge document created successfully');
  });

  public static getDocuments = asyncHandler(async (req: Request) => {
    const documents = await KnowledgeService.getDocuments(req.query);
    return new ApiResponse(200, documents, 'Knowledge documents retrieved successfully');
  });

  public static getDocumentById = asyncHandler(async (req: Request) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) throw new AppError('Document ID is required', 400);
    const doc = await KnowledgeService.getDocumentById(id);
    if (!doc) throw new AppError('Document not found', 404);
    return new ApiResponse(200, doc, 'Knowledge document retrieved successfully');
  });
}
