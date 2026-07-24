import { randomUUID } from 'crypto';

// In-memory store for agents (embeddings table can't be written via Prisma due to vector column constraint)
const agentStore: any[] = [
  { id: 'agent-sales', name: 'SalesAgent', description: 'Analyzes sales data and trends', type: 'domain', config: {}, status: 'Active', createdBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'agent-inventory', name: 'InventoryAgent', description: 'Monitors stock levels and reorder points', type: 'domain', config: {}, status: 'Active', createdBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'agent-finance', name: 'FinanceAgent', description: 'Handles budget analysis and ROI calculations', type: 'domain', config: {}, status: 'Active', createdBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'agent-logistics', name: 'LogisticsAgent', description: 'Manages shipment routing and delivery ETAs', type: 'domain', config: {}, status: 'Active', createdBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'agent-planner', name: 'PlannerAgent', description: 'Orchestrates multi-agent decision cycles', type: 'orchestrator', config: {}, status: 'Active', createdBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export class AgentService {
  public static async createAgent(data: {
    name: string;
    description?: string;
    type?: string;
    config?: Record<string, any>;
    createdBy: string;
  }) {
    const agent = {
      id: randomUUID(),
      name: data.name,
      description: data.description,
      type: data.type,
      config: data.config ?? {},
      status: 'Active',
      createdBy: data.createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    agentStore.push(agent);
    return agent;
  }

  public static async getAgents(filters: any = {}) {
    let agents = [...agentStore];

    if (filters.q) {
      const q = String(filters.q).toLowerCase();
      agents = agents.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          (a.description && a.description.toLowerCase().includes(q))
      );
    }

    if (filters.type) {
      agents = agents.filter((a) => a.type === filters.type);
    }

    agents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      summary: {
        total: agents.length,
        active: agents.filter((a) => a.status === 'Active').length,
        idle: agents.filter((a) => a.status === 'Idle').length,
        disabled: agents.filter((a) => a.status === 'Disabled').length,
      },
      agents,
    };
  }

  public static async getAgentById(id: string) {
    return agentStore.find((a) => a.id === id) || null;
  }

  public static async updateAgent(id: string, data: Partial<{
    name: string;
    description?: string;
    type?: string;
    config?: Record<string, any>;
  }>) {
    const idx = agentStore.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    agentStore[idx] = { ...agentStore[idx], ...data, updatedAt: new Date().toISOString() };
    return agentStore[idx];
  }

  public static async deleteAgent(id: string) {
    const idx = agentStore.findIndex((a) => a.id === id);
    if (idx === -1) return false;
    agentStore.splice(idx, 1);
    return true;
  }
}
