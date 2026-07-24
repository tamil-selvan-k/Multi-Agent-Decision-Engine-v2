import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Workflow,
  BookOpen,
  Lightbulb,
  BarChart3,
  ScrollText,
  Plug,
  Settings,
  Hexagon,
  TrendingUp,
  DollarSign,
  Boxes,
  Truck
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/agents", label: "Agents", icon: Users },
  { to: "/workflows", label: "Workflows", icon: Workflow },
  { to: "/knowledge-base", label: "Knowledge Base", icon: BookOpen },
  { to: "/recommendations", label: "Recommendations", icon: Lightbulb },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/sales-intelligence", label: "Sales Intelligence", icon: TrendingUp },
  { to: "/finance-intelligence", label: "Finance Intelligence", icon: DollarSign },
  { to: "/inventory-intelligence", label: "Inventory Intelligence", icon: Boxes },
  { to: "/logistics-intelligence", label: "Logistics Intelligence", icon: Truck },
  { to: "/audit-logs", label: "Audit Logs", icon: ScrollText },
  { to: "/integrations", label: "Integrations", icon: Plug },
  { to: "/settings", label: "Settings", icon: Settings }
];

export default function Sidebar({ user }) {
  return (
    <aside className="w-60 shrink-0 bg-navy-900 text-slate-300 flex flex-col h-screen sticky top-0">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center">
          <Hexagon className="w-5 h-5 text-white" fill="white" />
        </div>
        <div>
          <p className="text-white font-semibold leading-tight text-sm">MA-EDi</p>
          <p className="text-[11px] text-slate-400 leading-tight">Decision Intelligence</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-600 text-white"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/10 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-slate-600 flex items-center justify-center text-white text-sm font-semibold">
          {user?.name?.[0] ?? "A"}
        </div>
        <div className="min-w-0">
          <p className="text-sm text-white font-medium truncate">{user?.name ?? "Admin User"}</p>
          <p className="text-xs text-slate-400 truncate">{user?.email ?? "admin@enterprise.com"}</p>
        </div>
      </div>
    </aside>
  );
}
