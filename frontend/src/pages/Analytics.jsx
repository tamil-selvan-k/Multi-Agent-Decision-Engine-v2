import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import Topbar from "../components/Topbar.jsx";
import { api } from "../api/api.js";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#0ea5e9"];

export default function Analytics() {
  const [insights, setInsights] = useState([]);
  const [topAgents, setTopAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getDashboardInsights(), api.getTopAgentActivity()]).then(([i, t]) => {
      setInsights(i);
      setTopAgents(t);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <Topbar title="Analytics" subtitle="Trends and performance across the agent ecosystem" />

      {loading ? (
        <p className="text-slate-400 text-sm">Loading analytics…</p>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="card p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Recommendations vs Decisions</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={insights}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="recommendations" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="decisions" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Actions by Agent</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={topAgents}
                  dataKey="actions"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {topAgents.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
