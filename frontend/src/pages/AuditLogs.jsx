import { useEffect, useState } from "react";
import { Filter } from "lucide-react";
import Topbar from "../components/Topbar.jsx";
import { api } from "../api/api.js";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAuditLogs().then((data) => {
      setLogs(data);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <Topbar title="Audit Logs" subtitle="Track all system activities and decisions" />

      <div className="flex items-center justify-between mb-4">
        <button className="flex items-center gap-2 text-sm text-slate-600 border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50">
          <Filter className="w-4 h-4" /> Filters
        </button>
        <span className="text-sm text-slate-400">May 20 - May 27, 2024</span>
      </div>

      <div className="card p-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400 border-b border-slate-100">
              <th className="pb-3 font-medium">Time</th>
              <th className="pb-3 font-medium">Action</th>
              <th className="pb-3 font-medium">Agent/User</th>
              <th className="pb-3 font-medium">Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-slate-400">
                  Loading audit logs…
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b border-slate-50 last:border-0">
                  <td className="py-3 text-slate-500 whitespace-nowrap">{log.time}</td>
                  <td className="py-3 font-medium text-slate-800">{log.action}</td>
                  <td className="py-3 text-slate-500">{log.agent}</td>
                  <td className="py-3 text-slate-500">{log.details}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
