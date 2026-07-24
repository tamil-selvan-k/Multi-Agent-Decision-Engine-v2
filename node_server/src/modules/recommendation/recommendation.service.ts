import { randomUUID } from 'crypto';

const recommendationStore: any[] = [
  { id: 'rec-001', title: 'Increase safety stock for SKU-2045', description: 'Current stock below threshold', category: 'inventory', priority: 'high', status: 'New', impact: 'High Impact', agent: 'InventoryAgent', time: '2 hours ago', payload: {}, createdBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'rec-002', title: 'Renegotiate Supplier B contract', description: 'Quality score dropped below 80', category: 'procurement', priority: 'medium', status: 'In Progress', impact: 'Medium Impact', agent: 'LogisticsAgent', time: '5 hours ago', payload: {}, createdBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'rec-003', title: 'Expand marketing spend in Western region', description: 'Sales growth opportunity detected', category: 'sales', priority: 'medium', status: 'New', impact: 'Medium Impact', agent: 'SalesAgent', time: '1 day ago', payload: {}, createdBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'rec-004', title: 'Reduce R&D budget overshoot by 8%', description: 'Current spending exceeds budget allocation', category: 'finance', priority: 'high', status: 'New', impact: 'High Impact', agent: 'FinanceAgent', time: '1 day ago', payload: {}, createdBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export class RecommendationService {
  public static async createRecommendation(data: { title: string; description?: string; category?: string; priority?: string; status?: string; payload?: Record<string, any>; createdBy: string; }) {
    const rec = { id: randomUUID(), ...data, priority: data.priority ?? 'medium', status: data.status ?? 'New', impact: data.priority === 'high' ? 'High Impact' : 'Medium Impact', agent: 'System', time: 'Just now', payload: data.payload ?? {}, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    recommendationStore.push(rec);
    return rec;
  }

  public static async getRecommendations(filters: any = {}) {
    let recs = [...recommendationStore];
    if (filters.impact && filters.impact !== 'All Impact') {
      recs = recs.filter((r) => r.impact === filters.impact);
    }
    if (filters.status && filters.status !== 'All Status') {
      recs = recs.filter((r) => r.status === filters.status);
    }
    recs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return recs;
  }

  public static async getRecommendationById(id: string) {
    return recommendationStore.find((r) => r.id === id) || null;
  }

  public static async updateRecommendation(id: string, data: Partial<{ title: string; description?: string; category?: string; priority?: string; status?: string; payload?: Record<string, any>; }>) {
    const idx = recommendationStore.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    recommendationStore[idx] = { ...recommendationStore[idx], ...data, updatedAt: new Date().toISOString() };
    return recommendationStore[idx];
  }

  public static async deleteRecommendation(id: string) {
    const idx = recommendationStore.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    recommendationStore.splice(idx, 1);
    return true;
  }
}
