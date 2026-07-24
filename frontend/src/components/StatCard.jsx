import { ArrowUp, ArrowDown } from "lucide-react";

export default function StatCard({ label, value, change, direction, sublabel, icon }) {
  const isUp = direction === "up";
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
        {icon && <div className="text-brand-600">{icon}</div>}
      </div>
      {change !== undefined && (
        <div className="flex items-center gap-1 mt-3 text-xs">
          <span
            className={`flex items-center gap-0.5 font-medium ${
              isUp ? "text-emerald-600" : "text-red-500"
            }`}
          >
            {isUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {change}%
          </span>
          <span className="text-slate-400">{sublabel}</span>
        </div>
      )}
    </div>
  );
}
