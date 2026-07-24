import { Request } from 'express';
import { IntegrationService } from './integration.service';
import { asyncHandler } from '@utils/asyncHandler';
import { ApiResponse } from '@utils/ApiResponse';
import { AppError } from '@utils/AppError';

export class IntegrationController {
  public static getIntegrations = asyncHandler(async () => {
    const integrations = await IntegrationService.getIntegrations();
    return new ApiResponse(200, integrations, 'Integrations retrieved successfully');
  });

  public static toggleIntegration = asyncHandler(async (req: Request) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) throw new AppError('Integration ID is required', 400);
    const updated = await IntegrationService.toggleIntegration(id);
    if (!updated) throw new AppError('Integration not found', 404);
    return new ApiResponse(200, updated, 'Integration toggled successfully');
  });
}
