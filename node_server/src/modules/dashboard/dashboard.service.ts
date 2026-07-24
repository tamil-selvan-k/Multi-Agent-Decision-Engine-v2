export class DashboardService {
    public static async getDashboardData() {
        return {
            kpis: {
                totalDecisions: 124,
                pendingApprovals: 3,
                negotiationSuccessRate: 98.4,
                activeAgents: 4,
            },
            recentDecisions: [
                {
                    id: 'dec_101',
                    title: 'Q3 Inventory Rebalancing & Marketing Promotion',
                    status: 'APPROVED',
                    timestamp: new Date().toISOString(),
                },
                {
                    id: 'dec_102',
                    title: 'Logistics Expedition & Budget Overrun Waiver',
                    status: 'PENDING_APPROVAL',
                    timestamp: new Date().toISOString(),
                },
            ],
            alerts: [
                {
                    id: 'alt_01',
                    severity: 'WARNING',
                    message: 'Sales forecast exceeds current inventory stock in Western Region.',
                    timestamp: new Date().toISOString(),
                },
            ],
            insights: [
                { date: 'Jan', recommendations: 45, decisions: 32 },
                { date: 'Feb', recommendations: 56, decisions: 40 },
                { date: 'Mar', recommendations: 64, decisions: 50 },
                { date: 'Apr', recommendations: 72, decisions: 55 },
                { date: 'May', recommendations: 88, decisions: 70 },
                { date: 'Jun', recommendations: 95, decisions: 82 }
            ],
            topAgents: [
                { name: 'SalesAgent', actions: 42 },
                { name: 'InventoryAgent', actions: 35 },
                { name: 'FinanceAgent', actions: 28 },
                { name: 'LogisticsAgent', actions: 19 }
            ]
        };
    }
}

