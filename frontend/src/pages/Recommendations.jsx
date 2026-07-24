import { useEffect, useState } from "react";
import { ClipboardCheck } from "lucide-react";
import Topbar from "../components/Topbar.jsx";
import { api } from "../api/api.js";

const IMPACT_STYLES = {
  "High Impact": "bg-red-50 text-red-600",
  "Medium Impact": "bg-amber-50 text-amber-600",
  "Low Impact": "bg-slate-100 text-slate-500"
};

const STATUS_STYLES = {
  New: "bg-blue-50 text-blue-600",
  "In Progress": "bg-amber-50 text-amber-600",
  Completed: "bg-emerald-50 text-emerald-600"
};

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [impact, setImpact] = useState("All Impact");
  const [status, setStatus] = useState("All Status");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const data = await api.getRecommendations({ impact, status });
    setRecommendations(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [impact, status]);

  async function markCompleted(id) {
    const updated = await api.updateRecommendation(id, { status: "Completed" });
    setRecommendations((prev) => prev.map((r) => (r.id === id ? updated : r)));
  }

  return (
    <div>
      <Topbar title="Recommendations" subtitle="AI generated recommendations" />

      <div className="flex items-center gap-3 mb-4">
        <select
          value={impact}
          onChange={(e) => setImpact(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-600"
        >
          {["All Impact", "High Impact", "Medium Impact", "Low Impact"].map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-600"
        >
          {["All Status", "New", "In Progress", "Completed"].map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>

      <div className="card p-5">
        {loading ? (
          <p className="text-slate-400 text-sm">Loading recommendations…</p>
        ) : (
          <div className="space-y-3">
            {recommendations.map((r) => (
              <div
                key={r.id}
                className="flex items-start gap-3 border border-slate-100 rounded-xl p-4 hover:border-brand-200 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                  <ClipboardCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800">{r.title}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-xs text-slate-400">{r.agent}</span>
                    <span className={`badge ${IMPACT_STYLES[r.impact]}`}>{r.impact}</span>
                    <span className={`badge ${STATUS_STYLES[r.status]}`}>{r.status}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-slate-400 mb-2">{r.time}</p>
                  {r.status !== "Completed" && (
                    <button
                      onClick={() => markCompleted(r.id)}
                      className="text-xs font-medium text-brand-600 hover:underline"
                    >
                      Mark complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
