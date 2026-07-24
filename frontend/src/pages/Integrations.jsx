import { useEffect, useState } from "react";
import { Plug } from "lucide-react";
import Topbar from "../components/Topbar.jsx";
import { api } from "../api/api.js";

export default function Integrations() {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getIntegrations().then((data) => {
      setIntegrations(data);
      setLoading(false);
    });
  }, []);

  async function toggle(id) {
    const updated = await api.toggleIntegration(id);
    setIntegrations((prev) => prev.map((i) => (i.id === id ? updated : i)));
  }

  return (
    <div>
      <Topbar title="Integrations" subtitle="Connect enterprise systems to your agent network" />

      {loading ? (
        <p className="text-slate-400 text-sm">Loading integrations…</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {integrations.map((i) => (
            <div key={i.id} className="card p-5 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600">
                  <Plug className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">{i.name}</p>
                  <p className="text-xs text-slate-400">{i.category}</p>
                </div>
              </div>
              <button
                onClick={() => toggle(i.id)}
                className={`badge shrink-0 ${
                  i.status === "Connected"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {i.status}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
