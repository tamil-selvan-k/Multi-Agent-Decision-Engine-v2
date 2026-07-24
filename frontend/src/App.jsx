import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import { api } from "./api/api.js";

import Dashboard from "./pages/Dashboard.jsx";
import Agents from "./pages/Agents.jsx";
import Workflows from "./pages/Workflows.jsx";
import KnowledgeBase from "./pages/KnowledgeBase.jsx";
import Recommendations from "./pages/Recommendations.jsx";
import Analytics from "./pages/Analytics.jsx";
import AuditLogs from "./pages/AuditLogs.jsx";
import Integrations from "./pages/Integrations.jsx";
import Settings from "./pages/Settings.jsx";
import SalesIntelligencePage from "./pages/SalesIntelligencePage.jsx";
import FinanceIntelligencePage from "./pages/FinanceIntelligencePage.jsx";
import InventoryIntelligencePage from "./pages/InventoryIntelligencePage.jsx";
import LogisticsIntelligencePage from "./pages/LogisticsIntelligencePage.jsx";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.getMe().then(setUser).catch(() => setUser(null));
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar user={user} />
      <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/workflows" element={<Workflows />} />
          <Route path="/knowledge-base" element={<KnowledgeBase />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/sales-intelligence" element={<SalesIntelligencePage />} />
          <Route path="/finance-intelligence" element={<FinanceIntelligencePage />} />
          <Route path="/inventory-intelligence" element={<InventoryIntelligencePage />} />
          <Route path="/logistics-intelligence" element={<LogisticsIntelligencePage />} />
          <Route path="/audit-logs" element={<AuditLogs />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}
