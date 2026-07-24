import { DashboardService } from './dashboard.service';
import { asyncHandler } from '@utils/asyncHandler';
import { ApiResponse } from '@utils/ApiResponse';

export class DashboardController {
    public static getDashboard = asyncHandler(async () => {
        const data = await DashboardService.getDashboardData();
        return new ApiResponse(200, data, 'Dashboard metrics retrieved successfully');
    });

    public static getStats = asyncHandler(async () => {
        const data = await DashboardService.getDashboardData();
        return new ApiResponse(200, data.kpis, 'Dashboard stats retrieved successfully');
    });

    public static getInsights = asyncHandler(async () => {
        const data = await DashboardService.getDashboardData();
        return new ApiResponse(200, data.insights, 'Dashboard insights retrieved successfully');
    });

    public static getTopAgentActivity = asyncHandler(async () => {
        const data = await DashboardService.getDashboardData();
        return new ApiResponse(200, data.topAgents, 'Top agent activity retrieved successfully');
    });
}

