import { Request } from 'express';
import { z } from 'zod';
import { RecommendationService } from './recommendation.service';
import { asyncHandler } from '@utils/asyncHandler';
import { ApiResponse } from '@utils/ApiResponse';
import { AppError } from '@utils/AppError';
import { AuthenticatedRequest } from '@appTypes/auth.types';

const createRecommendationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  priority: z.string().optional(),
  status: z.string().optional(),
  payload: z.record(z.string(), z.any()).optional(),
});

const updateRecommendationSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  priority: z.string().optional(),
  status: z.string().optional(),
  payload: z.record(z.string(), z.any()).optional(),
});

export class RecommendationController {
  public static createRecommendation = asyncHandler(async (req: Request) => {
    const parseResult = createRecommendationSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new AppError('Invalid recommendation data', 400, parseResult.error.issues);
    }
    const userId = (req as AuthenticatedRequest).user?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);
    const recommendation = await RecommendationService.createRecommendation({ ...parseResult.data, createdBy: userId });
    return new ApiResponse(201, recommendation, 'Recommendation created successfully');
  });

  public static getRecommendations = asyncHandler(async (req: Request) => {
    const recommendations = await RecommendationService.getRecommendations(req.query);
    return new ApiResponse(200, recommendations, 'Recommendations retrieved successfully');
  });

  public static getRecommendationById = asyncHandler(async (req: Request) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) throw new AppError('Recommendation ID is required', 400);
    const recommendation = await RecommendationService.getRecommendationById(id);
    if (!recommendation) throw new AppError('Recommendation not found', 404);
    return new ApiResponse(200, recommendation, 'Recommendation retrieved successfully');
  });

  public static updateRecommendation = asyncHandler(async (req: Request) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) throw new AppError('Recommendation ID is required', 400);
    const parseResult = updateRecommendationSchema.safeParse(req.body);
    if (!parseResult.success) throw new AppError('Invalid update data', 400, parseResult.error.issues);
    const updated = await RecommendationService.updateRecommendation(id, parseResult.data);
    if (!updated) throw new AppError('Recommendation not found', 404);
    return new ApiResponse(200, updated, 'Recommendation updated successfully');
  });

  public static deleteRecommendation = asyncHandler(async (req: Request) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) throw new AppError('Recommendation ID is required', 400);
    const deleted = await RecommendationService.deleteRecommendation(id);
    if (!deleted) throw new AppError('Recommendation not found', 404);
    return new ApiResponse(200, { success: true }, 'Recommendation deleted successfully');
  });
}
