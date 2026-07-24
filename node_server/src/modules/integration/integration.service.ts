import { randomUUID } from 'crypto';

const integrationStore: any[] = [
  { id: 'int-001', name: 'Neon PostgreSQL', category: 'Database', type: 'database', status: 'Connected', isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'int-002', name: 'Groq LLM API', category: 'AI Services', type: 'ai', status: 'Connected', isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'int-003', name: 'Slack Notifications', category: 'Messaging', type: 'messaging', status: 'Disconnected', isActive: false, createdBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export class IntegrationService {
  public static async createIntegration(data: { name: string; type?: string; config?: Record<string, any>; isActive?: boolean; createdBy: string; }) {
    const integration = {
      id: randomUUID(),
      ...data,
      category: data.type ? data.type.charAt(0).toUpperCase() + data.type.slice(1) : 'General',
      isActive: data.isActive ?? true,
      status: data.isActive ? 'Connected' : 'Disconnected',
      config: data.config ?? {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    integrationStore.push(integration);
    return integration;
  }

  public static async getIntegrations() {
    return [...integrationStore].sort((a, b) => a.name.localeCompare(b.name));
  }

  public static async toggleIntegration(id: string) {
    const idx = integrationStore.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    const nextActive = !integrationStore[idx].isActive;
    integrationStore[idx] = {
      ...integrationStore[idx],
      isActive: nextActive,
      status: nextActive ? 'Connected' : 'Disconnected',
      updatedAt: new Date().toISOString()
    };
    return integrationStore[idx];
  }
}
