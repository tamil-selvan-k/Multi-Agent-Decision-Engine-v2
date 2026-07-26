import { useEffect, useState } from "react";
import { Search, Pencil, Trash2, Eye, Plus, Sparkles } from "lucide-react";
import Topbar from "../components/Topbar.jsx";
import { api } from "../api/api.js";
import AskAgentModal from "./widgets/AskAgentModal.jsx";

const STATUS_STYLES = {
  Active: "bg-emerald-50 text-emerald-600",
  Idle: "bg-amber-50 text-amber-600",
  Disabled: "bg-slate-100 text-slate-500"
};

export default function Agents() {
  const [summary, setSummary] = useState(null);
  const [agents, setAgents] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [askOpen, setAskOpen] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await api.getAgents({ q });
      setSummary(data.summary);
      setAgents(data.agents);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  async function handleDelete(id) {
    await api.deleteAgent(id);
    load();
  }

  return (
    <div>
      <Topbar title="Agents" subtitle="Manage and monitor all domain agents" />

      <div className="flex justify-end gap-2 mb-4">
        <button
          onClick={() => setAskOpen(true)}
          className="flex items-center gap-2 border border-brand-200 text-brand-600 bg-brand-100/60 text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-100"
        >
          <Sparkles className="w-4 h-4" /> Ask AI
        </button>
        {/* <button className="flex items-center gap-2 bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-500">
          <Plus className="w-4 h-4" /> New Agent
        </button> */}
      </div>

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <SummaryCard label="Total Agents" value={summary.total} />
          <SummaryCard label="Active" value={summary.active} />
          <SummaryCard label="Idle" value={summary.idle} />
          <SummaryCard label="Disabled" value={summary.disabled} />
        </div>
      )}

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search agents..."
              className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400 border-b border-slate-100">
              <th className="pb-3 font-medium">Agent Name</th>
              <th className="pb-3 font-medium">Domain</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Last Activity</th>
              <th className="pb-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-400">
                  Loading agents…
                </td>
              </tr>
            ) : (
              agents.map((a) => (
                <tr key={a.id} className="border-b border-slate-50 last:border-0">
                  <td className="py-3 font-medium text-slate-800">{a.name}</td>
                  <td className="py-3 text-slate-500">{a.domain}</td>
                  <td className="py-3">
                    <span className={`badge ${STATUS_STYLES[a.status]}`}>{a.status}</span>
                  </td>
                  <td className="py-3 text-slate-500">{a.lastActivity}</td>
                  <td className="py-3">
                    <div className="flex items-center justify-end gap-2 text-slate-400">
                      <button className="hover:text-brand-600">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="hover:text-brand-600">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button className="hover:text-red-500" onClick={() => handleDelete(a.id)}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {askOpen && <AskAgentModal onClose={() => setAskOpen(false)} />}
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="card p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
  );
}
