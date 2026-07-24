import { randomUUID } from 'crypto';

const workflowStore: any[] = [
  { id: 'wf-001', name: 'Demand Surge Response', description: 'Triggered when sales spike detected', status: 'Active', definition: {}, createdBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'wf-002', name: 'Budget Overrun Alert', description: 'Monitors department spending vs budget', status: 'Active', definition: {}, createdBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'wf-003', name: 'Supplier Evaluation', description: 'Weekly supplier reliability scoring', status: 'Paused', definition: {}, createdBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export class WorkflowService {
  public static async createWorkflow(data: { name: string; description?: string; definition?: Record<string, any>; createdBy: string; }) {
    const workflow = { id: randomUUID(), name: data.name, description: data.description, definition: data.definition ?? {}, status: 'Active', createdBy: data.createdBy, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    workflowStore.push(workflow);
    return workflow;
  }

  public static async getWorkflows(filters: any = {}) {
    let workflows = [...workflowStore];
    if (filters.q) {
      const q = String(filters.q).toLowerCase();
      workflows = workflows.filter((w) => w.name.toLowerCase().includes(q) || (w.description && w.description.toLowerCase().includes(q)));
    }
    workflows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return workflows;
  }

  public static async getWorkflowById(id: string) {
    return workflowStore.find((w) => w.id === id) || null;
  }

  public static async updateWorkflow(id: string, data: Partial<{ definition: Record<string, any>; status: string }>) {
    const idx = workflowStore.findIndex((w) => w.id === id);
    if (idx === -1) return null;
    workflowStore[idx] = { ...workflowStore[idx], ...data, updatedAt: new Date().toISOString() };
    return workflowStore[idx];
  }

  public static async deleteWorkflow(id: string) {
    const idx = workflowStore.findIndex((w) => w.id === id);
    if (idx === -1) return false;
    workflowStore.splice(idx, 1);
    return true;
  }
}
