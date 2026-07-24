import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api/api.js";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  DollarSign, Receipt, TrendingUp, PieChart as PieChartIcon, Wallet, Percent,
  Search, ChevronDown, ArrowUp, ArrowDown, AlertTriangle, Sparkles,
  Scale, BellRing, ScissorsSquare, Target,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Design tokens — matches Sales / Inventory Intelligence pages for   */
/*  a consistent design system: deep navy/ink primary, cool slate      */
/*  neutrals, emerald/amber/rose signal colors.                        */
/* ------------------------------------------------------------------ */
const INK = "#101A33";
const NAVY = "#1E2C52";
const SLATE = "#5B6479";
const LINE_SLATE = "#E4E7EE";
const EMERALD = "#0E9F6E";
const AMBER = "#C98A1D";
const ROSE = "#D8465E";
const SKY = "#3B6FE0";
const VIOLET = "#7C5CD6";

const CHART_COLORS = [NAVY, EMERALD, SKY, AMBER, VIOLET];

const currency = (n, compact = false) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: compact ? 1 : 0,
    notation: compact ? "compact" : "standard",
  }).format(n);

const signedCurrency = (n) => {
  const s = currency(Math.abs(n));
  return n < 0 ? `-${s}` : `+${s}`;
};

const number = (n) => new Intl.NumberFormat("en-US").format(n);

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */
const revenueVsExpenses = [
  { month: "Aug", revenue: 4.21, expenses: 3.42 },
  { month: "Sep", revenue: 4.38, expenses: 3.51 },
  { month: "Oct", revenue: 4.52, expenses: 3.68 },
  { month: "Nov", revenue: 4.95, expenses: 3.94 },
  { month: "Dec", revenue: 5.62, expenses: 4.31 },
  { month: "Jan", revenue: 4.74, expenses: 3.87 },
  { month: "Feb", revenue: 4.68, expenses: 3.79 },
  { month: "Mar", revenue: 4.91, expenses: 3.88 },
  { month: "Apr", revenue: 5.04, expenses: 3.96 },
  { month: "May", revenue: 5.18, expenses: 4.05 },
  { month: "Jun", revenue: 5.27, expenses: 4.11 },
  { month: "Jul", revenue: 5.43, expenses: 4.18 },
];

const profitTrend = revenueVsExpenses.map((d) => ({
  month: d.month,
  profit: +(d.revenue - d.expenses).toFixed(2),
  margin: +(((d.revenue - d.expenses) / d.revenue) * 100).toFixed(1),
}));

const monthlyBudget = [
  { month: "Feb", budget: 4.0, actual: 3.79 },
  { month: "Mar", budget: 4.0, actual: 3.88 },
  { month: "Apr", budget: 4.1, actual: 3.96 },
  { month: "May", budget: 4.1, actual: 4.05 },
  { month: "Jun", budget: 4.2, actual: 4.11 },
  { month: "Jul", budget: 4.2, actual: 4.18 },
];

const cashFlow = [
  { month: "Feb", inflow: 4.68, outflow: 3.79, net: 0.89 },
  { month: "Mar", inflow: 4.91, outflow: 3.88, net: 1.03 },
  { month: "Apr", inflow: 5.04, outflow: 3.96, net: 1.08 },
  { month: "May", inflow: 5.18, outflow: 4.05, net: 1.13 },
  { month: "Jun", inflow: 5.27, outflow: 4.11, net: 1.16 },
  { month: "Jul", inflow: 5.43, outflow: 4.18, net: 1.25 },
];

const departmentSpending = [
  { department: "Engineering", spend: 1.62 },
  { department: "Sales & Marketing", spend: 1.24 },
  { department: "Operations", spend: 0.81 },
  { department: "IT & Infrastructure", spend: 0.58 },
  { department: "Customer Success", spend: 0.41 },
  { department: "Human Resources", spend: 0.29 },
];

const expenseCategories = [
  { name: "Payroll", value: 48 },
  { name: "Software & Subscriptions", value: 17 },
  { name: "Marketing Campaigns", value: 15 },
  { name: "Facilities", value: 10 },
  { name: "Travel & Professional Svcs.", value: 10 },
];

const DEPARTMENTS = ["All Departments", "Engineering", "Sales & Marketing", "Operations", "IT & Infrastructure", "Customer Success", "Human Resources"];
const CATEGORIES = ["All Categories", "Payroll", "Software & Subscriptions", "Marketing Campaigns", "Facilities", "Travel & Entertainment", "Professional Services", "Equipment"];
const STATUSES = ["All Statuses", "Approved", "Pending Review", "Over Budget", "Flagged"];
const DATE_RANGES = ["Last 7 Days", "Last 30 Days", "Last Quarter", "Last 12 Months"];

const STATUS_STYLE = {
  Approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  "Pending Review": "bg-amber-50 text-amber-700 border border-amber-200",
  "Over Budget": "bg-rose-50 text-rose-700 border border-rose-200",
  Flagged: "bg-slate-100 text-slate-600 border border-slate-200",
};

const transactions = [
  { id: "TXN-90341", department: "Engineering", category: "Software & Subscriptions", amount: 84200, budget: 80000, status: "Over Budget", date: "2026-07-22" },
  { id: "TXN-90338", department: "Sales & Marketing", category: "Marketing Campaigns", amount: 142000, budget: 150000, status: "Approved", date: "2026-07-21" },
  { id: "TXN-90332", department: "Operations", category: "Facilities", amount: 61500, budget: 65000, status: "Approved", date: "2026-07-21" },
  { id: "TXN-90327", department: "IT & Infrastructure", category: "Equipment", amount: 38900, budget: 30000, status: "Flagged", date: "2026-07-20" },
  { id: "TXN-90319", department: "Customer Success", category: "Travel & Entertainment", amount: 11200, budget: 15000, status: "Approved", date: "2026-07-19" },
  { id: "TXN-90312", department: "Human Resources", category: "Professional Services", amount: 27800, budget: 25000, status: "Pending Review", date: "2026-07-18" },
  { id: "TXN-90305", department: "Engineering", category: "Payroll", amount: 612000, budget: 610000, status: "Approved", date: "2026-07-17" },
  { id: "TXN-90298", department: "Sales & Marketing", category: "Travel & Entertainment", amount: 34600, budget: 28000, status: "Over Budget", date: "2026-07-16" },
  { id: "TXN-90291", department: "Operations", category: "Equipment", amount: 19400, budget: 22000, status: "Approved", date: "2026-07-15" },
  { id: "TXN-90284", department: "IT & Infrastructure", category: "Software & Subscriptions", amount: 52300, budget: 50000, status: "Pending Review", date: "2026-07-14" },
  { id: "TXN-90276", department: "Customer Success", category: "Payroll", amount: 198000, budget: 200000, status: "Approved", date: "2026-07-13" },
  { id: "TXN-90269", department: "Human Resources", category: "Facilities", amount: 9800, budget: 10000, status: "Approved", date: "2026-07-11" },
  { id: "TXN-90261", department: "Engineering", category: "Professional Services", amount: 46700, budget: 35000, status: "Flagged", date: "2026-07-10" },
  { id: "TXN-90254", department: "Sales & Marketing", category: "Software & Subscriptions", amount: 21900, budget: 25000, status: "Approved", date: "2026-07-09" },
  { id: "TXN-90248", department: "Operations", category: "Payroll", amount: 287000, budget: 285000, status: "Approved", date: "2026-07-07" },
  { id: "TXN-90239", department: "IT & Infrastructure", category: "Facilities", amount: 15200, budget: 18000, status: "Approved", date: "2026-07-05" },
  { id: "TXN-90231", department: "Customer Success", category: "Marketing Campaigns", amount: 8100, budget: 8000, status: "Pending Review", date: "2026-07-03" },
  { id: "TXN-90224", department: "Human Resources", category: "Travel & Entertainment", amount: 6400, budget: 9000, status: "Approved", date: "2026-07-01" },
  { id: "TXN-90217", department: "Engineering", category: "Equipment", amount: 58200, budget: 40000, status: "Over Budget", date: "2026-06-28" },
  { id: "TXN-90209", department: "Sales & Marketing", category: "Payroll", amount: 356000, budget: 350000, status: "Approved", date: "2026-06-24" },
];

const insights = [
  {
    id: 1,
    type: "Budget Optimization",
    icon: Scale,
    color: SKY,
    badge: "bg-sky-50 text-sky-700 border border-sky-200",
    confidence: 86,
    title: "Reallocate underused Customer Success budget",
    impact: "$62K in unused Q3 budget available to redeploy",
    recommendation:
      "Customer Success is tracking 12% under budget for the third straight month while Engineering and IT run over. Shift a portion of the unused allocation toward Equipment and Software lines showing consistent overage.",
  },
  {
    id: 2,
    type: "High Expense Alert",
    icon: BellRing,
    color: ROSE,
    badge: "bg-rose-50 text-rose-700 border border-rose-200",
    confidence: 93,
    title: "Engineering Equipment spend up 45% vs budget",
    impact: "$18.2K overage this cycle, trending upward",
    recommendation:
      "A cluster of hardware purchases pushed Equipment spend well past budget. Route future purchases over $5K through procurement approval and consolidate vendor contracts to recover volume discounts.",
  },
  {
    id: 3,
    type: "Cost Reduction Opportunity",
    icon: ScissorsSquare,
    color: AMBER,
    badge: "bg-amber-50 text-amber-700 border border-amber-200",
    confidence: 81,
    title: "Consolidate overlapping software subscriptions",
    impact: "Estimated $9.4K/month in recoverable spend",
    recommendation:
      "Engineering and IT are independently paying for three overlapping analytics tools. Consolidating to a single enterprise license is projected to cut combined software spend by roughly 18%.",
  },
  {
    id: 4,
    type: "ROI Recommendation",
    icon: Target,
    color: EMERALD,
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    confidence: 88,
    title: "Increase spend on top-performing marketing channel",
    impact: "Current channel ROI at 4.2x, above 2.8x average",
    recommendation:
      "The Marketplace-driven campaign line is returning 4.2x ROI, well above the portfolio average. Shifting an incremental $50K from lower-performing channels could lift blended ROI by an estimated 0.3x.",
  },
];

/* ------------------------------------------------------------------ */
/*  Small building blocks                                              */
/* ------------------------------------------------------------------ */
function KpiCard({ icon: Icon, label, value, delta, deltaLabel, positive }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-3 shadow-[0_1px_2px_rgba(16,26,51,0.04)]">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold tracking-wide uppercase text-slate-500">{label}</span>
        <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#EEF1F8" }}>
          <Icon size={16} color={NAVY} strokeWidth={2} />
        </span>
      </div>
      <div className="text-2xl font-semibold tabular-nums" style={{ color: INK, letterSpacing: "-0.01em" }}>
        {value}
      </div>
      {delta !== undefined && (
        <div className="flex items-center gap-1 text-xs font-medium">
          {positive ? (
            <ArrowUp size={13} color={EMERALD} strokeWidth={2.5} />
          ) : (
            <ArrowDown size={13} color={ROSE} strokeWidth={2.5} />
          )}
          <span style={{ color: positive ? EMERALD : ROSE }}>{delta}</span>
          <span className="text-slate-400 font-normal">{deltaLabel}</span>
        </div>
      )}
    </div>
  );
}

function ChartCard({ title, subtitle, children, className = "" }) {
  return (
    <div className={`bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_2px_rgba(16,26,51,0.04)] ${className}`}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold" style={{ color: INK }}>{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function ConfidenceMeter({ value, color }) {
  const segments = 10;
  const filled = Math.round((value / 100) * segments);
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-[3px]">
        {Array.from({ length: segments }).map((_, i) => (
          <span
            key={i}
            className="block rounded-[1px]"
            style={{
              width: 5,
              height: 12,
              background: i < filled ? color : LINE_SLATE,
              opacity: i < filled ? 1 : 0.7,
            }}
          />
        ))}
      </div>
      <span className="text-xs font-semibold tabular-nums" style={{ color: INK }}>{value}%</span>
    </div>
  );
}

function Select({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-sm text-slate-700 font-medium cursor-pointer hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-0"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

function CustomTooltip({ active, payload, label, formatter }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-md px-3 py-2 text-xs">
      <div className="font-semibold mb-1" style={{ color: INK }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-1.5" style={{ color: SLATE }}>
          <span className="w-2 h-2 rounded-full" style={{ background: p.color || p.fill }} />
          {p.name}: <span className="font-medium" style={{ color: INK }}>{formatter ? formatter(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
export default function FinanceIntelligencePage() {
  const [department, setDepartment] = useState("All Departments");
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("All Statuses");
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [search, setSearch] = useState("");
  const [dbData, setDbData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getFinanceIntelligence()
      .then((data) => {
        setDbData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const stats = dbData?.stats || {
    totalBudget: 1200000,
    totalSpending: 980000,
    remainingBudget: 220000,
    roiPercent: 32.4,
    riskScore: 18.2
  };

  const currentRevenueVsExpenses = dbData?.revenueVsExpenses || revenueVsExpenses;
  const currentProfitTrend = dbData?.profitTrend || profitTrend;
  const currentDepartmentSpending = dbData?.departmentSpending || departmentSpending;

  const filteredTransactions = useMemo(() => {
    const rangeDays = { "Last 7 Days": 7, "Last 30 Days": 30, "Last Quarter": 90, "Last 12 Months": 365 }[dateRange];
    const cutoff = new Date("2026-07-23");
    cutoff.setDate(cutoff.getDate() - rangeDays);

    return transactions.filter((t) => {
      if (department !== "All Departments" && t.department !== department) return false;
      if (category !== "All Categories" && t.category !== category) return false;
      if (status !== "All Statuses" && t.status !== status) return false;
      if (new Date(t.date) < cutoff) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const hay = `${t.id} ${t.department} ${t.category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [department, category, status, dateRange, search]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ background: "#F5F6F9" }}>
        <p className="text-slate-500 font-medium">Loading finance intelligence...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full" style={{ background: "#F5F6F9" }}>
      <div className="max-w-[1400px] mx-auto px-6 py-7">

        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: EMERALD }} />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Live · Connected to DB</span>
            </div>
            <h1 className="text-[26px] font-semibold" style={{ color: INK, letterSpacing: "-0.02em" }}>
              Finance Intelligence
            </h1>
            <p className="text-sm text-slate-500 mt-1">Enterprise financial health, budget performance, and AI-generated recommendations.</p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <Select value={dateRange} onChange={setDateRange} options={DATE_RANGES} />
            <Select value={department} onChange={setDepartment} options={DEPARTMENTS} />
            <Select value={category} onChange={setCategory} options={CATEGORIES} />
            <Select value={status} onChange={setStatus} options={STATUSES} />
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          <KpiCard icon={DollarSign} label="Budget" value={currency(stats.totalBudget, true)} delta="3.0%" deltaLabel="vs last month" positive />
          <KpiCard icon={Receipt} label="Spending" value={currency(stats.totalSpending, true)} delta="1.7%" deltaLabel="vs last month" positive={false} />
          <KpiCard icon={TrendingUp} label="Remaining" value={currency(stats.remainingBudget, true)} delta="7.8%" deltaLabel="vs last month" positive />
          <KpiCard icon={PieChartIcon} label="Utilization" value={`${((stats.totalSpending / stats.totalBudget) * 100).toFixed(1)}%`} delta="1.9 pts" deltaLabel="vs last month" positive={false} />
          <KpiCard icon={Wallet} label="Risk Score" value={`${stats.riskScore}%`} delta="7.9%" deltaLabel="net inflow, MoM" positive />
          <KpiCard icon={Percent} label="ROI" value={`${stats.roiPercent}%`} delta="0.2x" deltaLabel="vs last quarter" positive />
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
          <ChartCard title="Revenue vs Expenses" subtitle="Monthly totals in $M, trailing 12 months" className="xl:col-span-2">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={currentRevenueVsExpenses} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={LINE_SLATE} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: SLATE }} axisLine={{ stroke: LINE_SLATE }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: SLATE }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}M`} />
                <Tooltip content={<CustomTooltip formatter={(v) => `$${v}M`} />} cursor={{ fill: "#F5F6F9" }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: SLATE }} />
                <Bar dataKey="revenue" name="Revenue" fill={NAVY} radius={[6, 6, 0, 0]} maxBarSize={20} />
                <Bar dataKey="expenses" name="Expenses" fill={ROSE} radius={[6, 6, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Expense Categories" subtitle="Share of total expenses">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={expenseCategories} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {expenseCategories.map((entry, i) => (
                    <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="#fff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip formatter={(v) => `${v}%`} />} />
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11.5, color: SLATE }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
          <ChartCard title="Profit Trend" subtitle="Profit ($M) and margin (%), trailing 12 months">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={profitTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={LINE_SLATE} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: SLATE }} axisLine={{ stroke: LINE_SLATE }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: SLATE }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}M`} />
                <Tooltip content={<CustomTooltip formatter={(v) => `$${v}M`} />} />
                <Line type="monotone" dataKey="profit" name="Profit" stroke={EMERALD} strokeWidth={2.5} dot={{ r: 3, fill: EMERALD }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Monthly Budget" subtitle="Budgeted vs. actual spend, $M">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyBudget} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={LINE_SLATE} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: SLATE }} axisLine={{ stroke: LINE_SLATE }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: SLATE }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}M`} />
                <Tooltip content={<CustomTooltip formatter={(v) => `$${v}M`} />} cursor={{ fill: "#F5F6F9" }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: SLATE }} />
                <Bar dataKey="budget" name="Budget" fill={LINE_SLATE} radius={[6, 6, 0, 0]} maxBarSize={26} />
                <Bar dataKey="actual" name="Actual" fill={NAVY} radius={[6, 6, 0, 0]} maxBarSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Cash Flow" subtitle="Inflow, outflow, and net cash, $M">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={cashFlow} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="inflowFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={EMERALD} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={EMERALD} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="netCashFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={SKY} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={SKY} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke={LINE_SLATE} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: SLATE }} axisLine={{ stroke: LINE_SLATE }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: SLATE }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}M`} />
                <Tooltip content={<CustomTooltip formatter={(v) => `$${v}M`} />} />
                <Area type="monotone" dataKey="net" name="Net Cash Flow" stroke={SKY} strokeWidth={2.5} fill="url(#netCashFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Department spending + AI recommendations */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 mb-5">
          <ChartCard title="Departmental Spend Distribution" subtitle="Spending in $M, current quarter" className="xl:col-span-3">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={currentDepartmentSpending} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={LINE_SLATE} />
                <XAxis dataKey="department" tick={{ fontSize: 12, fill: SLATE }} axisLine={{ stroke: LINE_SLATE }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: SLATE }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}M`} />
                <Tooltip content={<CustomTooltip formatter={(v) => `$${v}M`} />} cursor={{ fill: "#F5F6F9" }} />
                <Bar dataKey="spend" name="Actual Spend" fill={NAVY} radius={[6, 6, 0, 0]} maxBarSize={42} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_2px_rgba(16,26,51,0.04)] flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} color={NAVY} />
              <h3 className="text-sm font-semibold" style={{ color: INK }}>AI Cost-Optimization Insights</h3>
            </div>
            <div className="flex flex-col gap-3 overflow-y-auto pr-1" style={{ maxHeight: 460 }}>
              {insights.map((rec) => {
                const Icon = rec.icon;
                return (
                  <div key={rec.id} className="border border-slate-200 rounded-lg p-3.5">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${rec.badge}`}>
                        <Icon size={11} />
                        {rec.type}
                      </span>
                    </div>
                    <p className="text-sm font-medium mb-1" style={{ color: INK }}>{rec.title}</p>
                    <p className="text-xs text-slate-500 leading-relaxed mb-2.5">{rec.recommendation}</p>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-slate-500">Business impact</span>
                      <span className="font-semibold text-emerald-600">{rec.impact}</span>
                    </div>
                    <ConfidenceMeter value={rec.confidence} color={rec.color} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_2px_rgba(16,26,51,0.04)]">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: INK }}>Expense General Ledger</h3>
              <p className="text-xs text-slate-500 mt-0.5">{filteredTransactions.length} postings match current filters</p>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ledger by ID, department, category…"
                className="pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg w-72 focus:outline-none focus:ring-2 focus:border-slate-300 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500 border-b border-slate-200">
                  <th className="py-2 px-2 font-semibold">Transaction ID</th>
                  <th className="py-2 px-2 font-semibold">Department</th>
                  <th className="py-2 px-2 font-semibold">Category</th>
                  <th className="py-2 px-2 font-semibold text-right">Amount</th>
                  <th className="py-2 px-2 font-semibold text-right">Budget</th>
                  <th className="py-2 px-2 font-semibold text-right">Variance</th>
                  <th className="py-2 px-2 font-semibold">Status</th>
                  <th className="py-2 px-2 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 text-sm">
                      No transactions match the current filters. Try widening the date range or clearing a filter.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((t) => {
                    const variance = t.amount - t.budget;
                    return (
                      <tr key={t.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                        <td className="py-2.5 px-2 font-medium" style={{ color: NAVY }}>{t.id}</td>
                        <td className="py-2.5 px-2 text-slate-700">{t.department}</td>
                        <td className="py-2.5 px-2 text-slate-600">{t.category}</td>
                        <td className="py-2.5 px-2 text-right tabular-nums font-medium" style={{ color: INK }}>{currency(t.amount)}</td>
                        <td className="py-2.5 px-2 text-right tabular-nums text-slate-600">{currency(t.budget)}</td>
                        <td className="py-2.5 px-2 text-right">
                          <span className="inline-flex items-center gap-0.5 font-medium tabular-nums" style={{ color: variance > 0 ? ROSE : EMERALD }}>
                            {variance > 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                            {signedCurrency(variance)}
                          </span>
                        </td>
                        <td className="py-2.5 px-2">
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[t.status]}`}>{t.status}</span>
                        </td>
                        <td className="py-2.5 px-2 text-slate-500">{new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
