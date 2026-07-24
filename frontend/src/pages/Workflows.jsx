import { useEffect, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import Topbar from "../components/Topbar.jsx";
import { api } from "../api/api.js";

export default function Workflows() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getWorkflows().then((data) => {
      setWorkflows(data);
      setLoading(false);
    });
  }, []);

  async function toggleStatus(w) {
    const nextStatus = w.status === "Active" ? "Paused" : "Active";
    const updated = await api.updateWorkflow(w.id, { status: nextStatus });
    setWorkflows((prev) => prev.map((wf) => (wf.id === w.id ? updated : wf)));
  }

  return (
    <div>
      <Topbar title="Workflows" subtitle="Design and monitor decision workflows" />

      <div className="flex justify-end gap-2 mb-4">
        <button className="flex items-center gap-2 border border-slate-200 text-slate-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-50">
          <Pencil className="w-4 h-4" /> Edit
        </button>
        <button className="flex items-center gap-2 bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-500">
          <Plus className="w-4 h-4" /> New Workflow
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-1">
          <h3 className="font-semibold text-slate-900 mb-4">All Workflows</h3>
          {loading ? (
            <p className="text-slate-400 text-sm">Loading workflows…</p>
          ) : (
            <div className="space-y-3">
              {workflows.map((w) => (
                <button
                  key={w.id}
                  onClick={() => toggleStatus(w)}
                  className="w-full flex items-center justify-between border border-slate-100 rounded-xl px-4 py-3 hover:border-brand-200 transition-colors text-left"
                >
                  <span className="text-sm font-medium text-slate-800">{w.name}</span>
                  <span
                    className={`badge ${
                      w.status === "Active"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {w.status}
                  </span>
                </button>
              ))}
            </div>
          )}
          <p className="text-xs text-slate-400 mt-4">Click a workflow to toggle Active / Paused.</p>
        </div>

        <div className="card p-8 lg:col-span-2 flex flex-col items-center justify-center gap-6">
          <div className="text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-4 py-1.5">
            User Request
          </div>
          <div className="w-px h-6 bg-slate-200" />
          <div className="text-sm font-medium text-brand-600 bg-brand-100 rounded-full px-4 py-1.5">
            Enterprise Planner Agent
          </div>
          <div className="w-px h-6 bg-slate-200" />
          <div className="text-xs text-slate-400">Intent Analysis</div>
          <div className="w-px h-6 bg-slate-200" />
          <div className="text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-4 py-1.5">
            Domain Agents
          </div>
          <div className="flex items-center gap-3">
            {["Sales", "Inventory", "Finance", "Knowledge Base"].map((d) => (
              <div
                key={d}
                className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[10px] text-center text-slate-500 font-medium"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="w-px h-6 bg-slate-200" />
          <div className="flex items-center gap-3">
            <div className="text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-4 py-1.5">
              Decision Engine
            </div>
            <div className="text-xs font-medium text-emerald-600 bg-emerald-50 rounded-full px-4 py-1.5">
              Final Decision
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
