import { Search, Bell, Moon } from "lucide-react";

export default function Topbar({ title, subtitle }) {
  return (
    <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search anything..."
            className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <button className="relative w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50">
          <Bell className="w-4 h-4 text-slate-500" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
            8
          </span>
        </button>
        <button className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50">
          <Moon className="w-4 h-4 text-slate-500" />
        </button>
      </div>
    </div>
  );
}
