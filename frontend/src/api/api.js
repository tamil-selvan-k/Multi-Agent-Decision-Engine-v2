// Central API client. Every network call in the app goes through here.
// In dev, Vite proxies "/api" to the Express backend (see vite.config.js).
const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.message || body.error || `Request failed: ${res.status}`);
  }
  if (body && typeof body === "object" && "success" in body && "data" in body) {
    return body.data;
  }
  return body;
}


export const api = {
  // Dashboard
  getDashboardStats: () => request("/dashboard/stats"),
  getDashboardInsights: () => request("/dashboard/insights"),
  getTopAgentActivity: () => request("/dashboard/top-agent-activity"),

  // Intelligence (Postgres DB backed)
  getSalesIntelligence: () => request("/intelligence/sales"),
  getInventoryIntelligence: () => request("/intelligence/inventory"),
  getFinanceIntelligence: () => request("/intelligence/finance"),
  getLogisticsIntelligence: () => request("/intelligence/logistics"),

  // Agents
  getAgents: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/agents${qs ? `?${qs}` : ""}`);
  },
  createAgent: (payload) => request("/agents", { method: "POST", body: JSON.stringify(payload) }),
  deleteAgent: (id) => request(`/agents/${id}`, { method: "DELETE" }),

  // Workflows
  getWorkflows: () => request("/workflows"),
  updateWorkflow: (id, payload) =>
    request(`/workflows/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),

  // Recommendations
  getRecommendations: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/recommendations${qs ? `?${qs}` : ""}`);
  },
  updateRecommendation: (id, payload) =>
    request(`/recommendations/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),

  // Knowledge base
  getKnowledgeCategories: () => request("/knowledge/categories"),
  getKnowledgeDocuments: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/knowledge/documents${qs ? `?${qs}` : ""}`);
  },

  // Audit logs
  getAuditLogs: () => request("/audit-logs"),

  // Integrations
  getIntegrations: () => request("/integrations"),
  toggleIntegration: (id) => request(`/integrations/${id}`, { method: "PATCH" }),

  // Chat
  getChatMessages: () => request("/chat/messages"),
  sendChatMessage: (text) =>
    request("/chat/messages", { method: "POST", body: JSON.stringify({ text }) }),

  // User
  getMe: () => request("/me")
};
