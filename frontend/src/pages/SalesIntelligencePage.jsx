import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api/api.js";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  DollarSign, ShoppingCart, TrendingUp, ArrowUpRight, Target, Smile,
  Search, ChevronDown, ArrowUp, ArrowDown, AlertTriangle, Sparkles,
  ArrowUpCircle, ArrowDownCircle, PauseCircle,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Design tokens                                                      */
/*  Palette: deep navy/ink primary, cool slate neutrals, a single      */
/*  emerald accent for positive signal, amber for caution, rose for    */
/*  decline. No cream/terracotta, no near-black+neon, no broadsheet.   */
/* ------------------------------------------------------------------ */
const INK = "#101A33";        // primary ink / headings
const NAVY = "#1E2C52";       // brand navy accent
const SLATE = "#5B6479";      // secondary text
const LINE_SLATE = "#E4E7EE"; // hairlines / grid
const EMERALD = "#0E9F6E";    // positive
const AMBER = "#C98A1D";      // caution / medium priority
const ROSE = "#D8465E";       // decline / high priority
const SKY = "#3B6FE0";        // data accent 2
const VIOLET = "#7C5CD6";     // data accent 3

const CHART_COLORS = [NAVY, EMERALD, SKY, AMBER, VIOLET];

const currency = (n, compact = false) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: compact ? 1 : 0,
    notation: compact ? "compact" : "standard",
  }).format(n);

const number = (n) => new Intl.NumberFormat("en-US").format(n);

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */
const revenueTrend = [
  { month: "Aug", revenue: 2.41, orders: 3120 },
  { month: "Sep", revenue: 2.58, orders: 3260 },
  { month: "Oct", revenue: 2.72, orders: 3390 },
  { month: "Nov", revenue: 3.05, orders: 3810 },
  { month: "Dec", revenue: 3.62, orders: 4520 },
  { month: "Jan", revenue: 2.94, orders: 3480 },
  { month: "Feb", revenue: 2.88, orders: 3390 },
  { month: "Mar", revenue: 3.11, orders: 3670 },
  { month: "Apr", revenue: 3.24, orders: 3790 },
  { month: "May", revenue: 3.38, orders: 3910 },
  { month: "Jun", revenue: 3.47, orders: 4010 },
  { month: "Jul", revenue: 3.63, orders: 4180 },
];

const forecastData = [
  { month: "Apr", actual: 3.24, forecast: null },
  { month: "May", actual: 3.38, forecast: null },
  { month: "Jun", actual: 3.47, forecast: null },
  { month: "Jul", actual: 3.63, forecast: 3.6 },
  { month: "Aug", actual: null, forecast: 3.81 },
  { month: "Sep", actual: null, forecast: 3.95 },
  { month: "Oct", actual: null, forecast: 4.12 },
];

const revenueByRegion = [
  { region: "North", revenue: 9.82 },
  { region: "East", revenue: 8.14 },
  { region: "West", revenue: 7.36 },
  { region: "Central", revenue: 5.21 },
  { region: "South", revenue: 4.03 },
];

const categorySales = [
  { name: "Electronics", value: 34 },
  { name: "Premium Collection", value: 24 },
  { name: "Home & Kitchen", value: 18 },
  { name: "Apparel", value: 14 },
  { name: "Sports & Outdoors", value: 10 },
];

const channelPerformance = [
  { channel: "Online Store", revenue: 12.4 },
  { channel: "Retail Partners", revenue: 8.9 },
  { channel: "Marketplace", revenue: 6.3 },
  { channel: "Direct Sales", revenue: 4.7 },
  { channel: "Reseller Network", revenue: 2.3 },
];

const topProducts = [
  { rank: 1, name: "Aria Wireless Earbuds Pro", category: "Electronics", units: 18420, revenue: 2_762_000, growth: 18.4 },
  { rank: 2, name: "Summit 4-Slice Toaster", category: "Home & Kitchen", units: 14210, revenue: 1_137_000, growth: 6.1 },
  { rank: 3, name: "Vantage Running Jacket", category: "Apparel", units: 12980, revenue: 973_000, growth: -3.2 },
  { rank: 4, name: "Nimbus Smart Thermostat", category: "Electronics", units: 11340, revenue: 1_814_000, growth: 22.7 },
  { rank: 5, name: "Meridian Leather Backpack", category: "Premium Collection", units: 9870, revenue: 2_048_000, growth: 14.9 },
  { rank: 6, name: "Everline Yoga Mat Set", category: "Sports & Outdoors", units: 9410, revenue: 512_000, growth: 4.4 },
  { rank: 7, name: "Halcyon 65\" OLED Display", category: "Electronics", units: 3120, revenue: 3_432_000, growth: 27.3 },
  { rank: 8, name: "Ridgeline Insulated Cooler", category: "Sports & Outdoors", units: 7640, revenue: 611_000, growth: -1.6 },
  { rank: 9, name: "Onyx Chrono Watch", category: "Premium Collection", units: 5230, revenue: 1_884_000, growth: 11.2 },
  { rank: 10, name: "Cascade Stand Mixer", category: "Home & Kitchen", units: 6810, revenue: 887_000, growth: 2.8 },
];

const insights = [
  {
    id: 1,
    priority: "High",
    confidence: 92,
    title: "Increase production for Halcyon 65\" OLED Display",
    impact: "+$410K projected revenue over 60 days",
    recommendation:
      "Demand is outpacing current allocation by 27% month over month. Raise production run size for the next cycle and prioritize East and North warehouse replenishment.",
  },
  {
    id: 2,
    priority: "High",
    confidence: 87,
    title: "Demand expected to rise next month",
    impact: "Forecast +5.7% MoM revenue lift",
    recommendation:
      "Seasonal signal plus early-quarter reorder patterns point to a broad demand increase. Pre-position inventory and lock in supplier capacity now to avoid stockouts.",
  },
  {
    id: 3,
    priority: "Medium",
    confidence: 78,
    title: "Southern region sales declining",
    impact: "-$180K vs. prior quarter run-rate",
    recommendation:
      "South is the only region trending down three months straight. Audit regional pricing and channel mix, and consider a targeted promotion with the Reseller Network partners there.",
  },
  {
    id: 4,
    priority: "Low",
    confidence: 83,
    title: "Premium category performing well",
    impact: "24% share of category mix, up 4 pts",
    recommendation:
      "Premium Collection continues to outperform. Expand premium SKU count and feature the line more prominently on the Online Store landing page.",
  },
  {
    id: 5,
    priority: "Medium",
    confidence: 71,
    title: "Apparel margin compression",
    impact: "Gross margin down 2.1 pts",
    recommendation:
      "Vantage Running Jacket returns are elevated. Review sizing guidance and consider a size-fit content update before the next markdown cycle.",
  },
];

const REGIONS = ["All Regions", "North", "South", "East", "West", "Central"];
const CATEGORIES = ["All Categories", "Electronics", "Apparel", "Home & Kitchen", "Sports & Outdoors", "Premium Collection"];
const CHANNELS = ["All Channels", "Online Store", "Retail Partners", "Marketplace", "Direct Sales", "Reseller Network"];
const DATE_RANGES = ["Last 7 Days", "Last 30 Days", "Last Quarter", "Last 12 Months"];

const recentOrders = [
  { id: "ORD-48291", customer: "Meridian Retail Group", product: "Halcyon 65\" OLED Display", region: "East", channel: "Retail Partners", category: "Electronics", quantity: 12, revenue: 15840, status: "Fulfilled", date: "2026-07-22" },
  { id: "ORD-48290", customer: "Northwind Distribution", product: "Aria Wireless Earbuds Pro", region: "North", channel: "Online Store", category: "Electronics", quantity: 240, revenue: 36000, status: "Fulfilled", date: "2026-07-22" },
  { id: "ORD-48288", customer: "Coastal Home Supply", product: "Cascade Stand Mixer", region: "West", channel: "Marketplace", category: "Home & Kitchen", quantity: 45, revenue: 5872, status: "Processing", date: "2026-07-21" },
  { id: "ORD-48285", customer: "Solstice Sportswear", product: "Vantage Running Jacket", region: "South", channel: "Retail Partners", category: "Apparel", quantity: 80, revenue: 5992, status: "Fulfilled", date: "2026-07-21" },
  { id: "ORD-48280", customer: "Ferro Direct LLC", product: "Onyx Chrono Watch", region: "Central", channel: "Direct Sales", category: "Premium Collection", quantity: 6, revenue: 2160, status: "Fulfilled", date: "2026-07-20" },
  { id: "ORD-48277", customer: "Bluepeak Electronics", product: "Nimbus Smart Thermostat", region: "East", channel: "Online Store", category: "Electronics", quantity: 95, revenue: 15200, status: "Shipped", date: "2026-07-20" },
  { id: "ORD-48271", customer: "Harbor Outdoor Co.", product: "Ridgeline Insulated Cooler", region: "West", channel: "Marketplace", category: "Sports & Outdoors", quantity: 60, revenue: 4800, status: "Fulfilled", date: "2026-07-19" },
  { id: "ORD-48266", customer: "Vantage Reseller Network", product: "Meridian Leather Backpack", region: "North", channel: "Reseller Network", category: "Premium Collection", quantity: 22, revenue: 4576, status: "Cancelled", date: "2026-07-19" },
  { id: "ORD-48260", customer: "Southgate Marketplace", product: "Everline Yoga Mat Set", region: "South", channel: "Marketplace", category: "Sports & Outdoors", quantity: 130, revenue: 7085, status: "Fulfilled", date: "2026-07-18" },
  { id: "ORD-48254", customer: "Prime Retail Alliance", product: "Halcyon 65\" OLED Display", region: "Central", channel: "Retail Partners", category: "Electronics", quantity: 8, revenue: 10560, status: "Processing", date: "2026-07-18" },
  { id: "ORD-48249", customer: "Northwind Distribution", product: "Summit 4-Slice Toaster", region: "North", channel: "Online Store", category: "Home & Kitchen", quantity: 210, revenue: 16800, status: "Fulfilled", date: "2026-07-17" },
  { id: "ORD-48241", customer: "Ferro Direct LLC", product: "Onyx Chrono Watch", region: "Central", channel: "Direct Sales", category: "Premium Collection", quantity: 4, revenue: 1440, status: "Shipped", date: "2026-07-16" },
  { id: "ORD-48233", customer: "Coastal Home Supply", product: "Cascade Stand Mixer", region: "West", channel: "Marketplace", category: "Home & Kitchen", quantity: 33, revenue: 4306, status: "Fulfilled", date: "2026-07-15" },
  { id: "ORD-48228", customer: "Bluepeak Electronics", product: "Aria Wireless Earbuds Pro", region: "East", channel: "Online Store", category: "Electronics", quantity: 175, revenue: 26250, status: "Fulfilled", date: "2026-07-14" },
  { id: "ORD-48219", customer: "Solstice Sportswear", product: "Vantage Running Jacket", region: "South", channel: "Retail Partners", category: "Apparel", quantity: 54, revenue: 4045, status: "Returned", date: "2026-07-13" },
  { id: "ORD-48210", customer: "Harbor Outdoor Co.", product: "Ridgeline Insulated Cooler", region: "West", channel: "Marketplace", category: "Sports & Outdoors", quantity: 40, revenue: 3200, status: "Fulfilled", date: "2026-07-11" },
  { id: "ORD-48198", customer: "Vantage Reseller Network", product: "Meridian Leather Backpack", region: "North", channel: "Reseller Network", category: "Premium Collection", quantity: 17, revenue: 3536, status: "Fulfilled", date: "2026-07-09" },
  { id: "ORD-48187", customer: "Prime Retail Alliance", product: "Nimbus Smart Thermostat", region: "Central", channel: "Retail Partners", category: "Electronics", quantity: 28, revenue: 4480, status: "Shipped", date: "2026-07-06" },
  { id: "ORD-48172", customer: "Southgate Marketplace", product: "Everline Yoga Mat Set", region: "South", channel: "Marketplace", category: "Sports & Outdoors", quantity: 88, revenue: 4796, status: "Fulfilled", date: "2026-07-02" },
  { id: "ORD-48160", customer: "Meridian Retail Group", product: "Summit 4-Slice Toaster", region: "East", channel: "Retail Partners", category: "Home & Kitchen", quantity: 64, revenue: 5120, status: "Fulfilled", date: "2026-06-27" },
];

const STATUS_STYLE = {
  Fulfilled: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Shipped: "bg-sky-50 text-sky-700 border border-sky-200",
  Processing: "bg-amber-50 text-amber-700 border border-amber-200",
  Cancelled: "bg-rose-50 text-rose-700 border border-rose-200",
  Returned: "bg-slate-100 text-slate-600 border border-slate-200",
};

const PRIORITY_STYLE = {
  High: { badge: "bg-rose-50 text-rose-700 border border-rose-200", icon: ArrowUpCircle, color: ROSE },
  Medium: { badge: "bg-amber-50 text-amber-700 border border-amber-200", icon: PauseCircle, color: AMBER },
  Low: { badge: "bg-emerald-50 text-emerald-700 border border-emerald-200", icon: ArrowDownCircle, color: EMERALD },
};

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
        style={{ boxShadow: "none" }}
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
export default function SalesIntelligencePage() {
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [region, setRegion] = useState("All Regions");
  const [category, setCategory] = useState("All Categories");
  const [channel, setChannel] = useState("All Channels");
  const [search, setSearch] = useState("");
  const [dbData, setDbData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getSalesIntelligence()
      .then((data) => {
        setDbData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const stats = dbData?.stats || {
    totalRevenue: 34560000,
    totalOrders: 42980,
    avgOrderValue: 804,
    salesGrowth: 6.7,
    customerSatisfaction: 92
  };

  const currentTrend = dbData?.revenueTrend || revenueTrend;
  const currentRegion = dbData?.revenueByRegion || revenueByRegion;
  const currentOrders = dbData?.recentOrders || recentOrders;

  const filteredOrders = useMemo(() => {
    const rangeDays = { "Last 7 Days": 7, "Last 30 Days": 30, "Last Quarter": 90, "Last 12 Months": 365 }[dateRange];
    const cutoff = new Date("2026-07-23");
    cutoff.setDate(cutoff.getDate() - rangeDays);

    return currentOrders.filter((o) => {
      if (region !== "All Regions" && o.region !== region) return false;
      if (category !== "All Categories" && o.category !== category) return false;
      if (channel !== "All Channels" && o.channel !== channel) return false;
      if (new Date(o.date) < cutoff) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const hay = `${o.id} ${o.customer} ${o.product}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [dateRange, region, category, channel, search, currentOrders]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ background: "#F5F6F9" }}>
        <p className="text-slate-500 font-medium">Loading sales intelligence...</p>
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
              Sales Intelligence
            </h1>
            <p className="text-sm text-slate-500 mt-1">Performance, trends, and AI-generated recommendations across all regions and channels.</p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <Select value={dateRange} onChange={setDateRange} options={DATE_RANGES} />
            <Select value={region} onChange={setRegion} options={REGIONS} />
            <Select value={category} onChange={setCategory} options={CATEGORIES} />
            <Select value={channel} onChange={setChannel} options={CHANNELS} />
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          <KpiCard icon={DollarSign} label="Total Revenue" value={currency(stats.totalRevenue, true)} delta="8.4%" deltaLabel="vs last month" positive />
          <KpiCard icon={ShoppingCart} label="Total Orders" value={number(stats.totalOrders)} delta="5.1%" deltaLabel="vs last month" positive />
          <KpiCard icon={TrendingUp} label="Avg. Order Value" value={currency(stats.avgOrderValue)} delta="2.9%" deltaLabel="vs last month" positive />
          <KpiCard icon={ArrowUpRight} label="Monthly Growth" value={`${stats.salesGrowth}%`} delta="1.2 pts" deltaLabel="vs prior period" positive />
          <KpiCard icon={Target} label="Forecast Accuracy" value="94.2%" delta="0.6 pts" deltaLabel="vs last quarter" positive />
          <KpiCard icon={Smile} label="Customer Satisfaction" value={`${(stats.customerSatisfaction / 20).toFixed(1)} / 5`} delta="0.3%" deltaLabel="vs last month" positive={false} />
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
          <ChartCard title="Monthly Revenue Trend" subtitle="Revenue in $M, trailing 12 months" className="xl:col-span-2">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={currentTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={LINE_SLATE} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: SLATE }} axisLine={{ stroke: LINE_SLATE }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: SLATE }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}M`} />
                <Tooltip content={<CustomTooltip formatter={(v) => `$${v}M`} />} />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke={NAVY} strokeWidth={2.5} dot={{ r: 3, fill: NAVY }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Product Category Sales" subtitle="Share of total revenue">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={categorySales} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {categorySales.map((entry, i) => (
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
                  wrapperStyle={{ fontSize: 12, color: SLATE }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
          <ChartCard title="Sales Forecast" subtitle="Actual vs. projected revenue, $M">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={forecastData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="actualFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={NAVY} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={NAVY} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="forecastFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={SKY} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={SKY} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke={LINE_SLATE} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: SLATE }} axisLine={{ stroke: LINE_SLATE }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: SLATE }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}M`} />
                <Tooltip content={<CustomTooltip formatter={(v) => `$${v}M`} />} />
                <Area type="monotone" dataKey="actual" name="Actual" stroke={NAVY} strokeWidth={2.5} fill="url(#actualFill)" connectNulls />
                <Area type="monotone" dataKey="forecast" name="Forecast" stroke={SKY} strokeWidth={2.5} strokeDasharray="5 4" fill="url(#forecastFill)" connectNulls />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Revenue by Region" subtitle="Revenue in $M, current quarter">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={currentRegion} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={LINE_SLATE} />
                <XAxis dataKey="region" tick={{ fontSize: 12, fill: SLATE }} axisLine={{ stroke: LINE_SLATE }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: SLATE }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}M`} />
                <Tooltip content={<CustomTooltip formatter={(v) => `$${v}M`} />} cursor={{ fill: "#F5F6F9" }} />
                <Bar dataKey="revenue" name="Revenue" fill={NAVY} radius={[6, 6, 0, 0]} maxBarSize={42} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Sales Channel Performance" subtitle="Revenue in $M by channel">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={channelPerformance} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid horizontal={false} stroke={LINE_SLATE} />
                <XAxis type="number" tick={{ fontSize: 12, fill: SLATE }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}M`} />
                <YAxis type="category" dataKey="channel" tick={{ fontSize: 11.5, fill: SLATE }} axisLine={false} tickLine={false} width={110} />
                <Tooltip content={<CustomTooltip formatter={(v) => `$${v}M`} />} cursor={{ fill: "#F5F6F9" }} />
                <Bar dataKey="revenue" name="Revenue" fill={EMERALD} radius={[0, 6, 6, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Top products + AI insights */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 mb-5">
          <ChartCard title="Top 10 Products" subtitle="Ranked by revenue, current quarter" className="xl:col-span-3">
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500 border-b border-slate-200">
                    <th className="py-2 px-1 font-semibold">#</th>
                    <th className="py-2 px-1 font-semibold">Product</th>
                    <th className="py-2 px-1 font-semibold">Category</th>
                    <th className="py-2 px-1 font-semibold text-right">Units</th>
                    <th className="py-2 px-1 font-semibold text-right">Revenue</th>
                    <th className="py-2 px-1 font-semibold text-right">Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p) => (
                    <tr key={p.rank} className="border-b border-slate-100 last:border-0">
                      <td className="py-2.5 px-1 text-slate-400 font-medium">{p.rank}</td>
                      <td className="py-2.5 px-1 font-medium" style={{ color: INK }}>{p.name}</td>
                      <td className="py-2.5 px-1 text-slate-500">{p.category}</td>
                      <td className="py-2.5 px-1 text-right tabular-nums text-slate-600">{number(p.units)}</td>
                      <td className="py-2.5 px-1 text-right tabular-nums font-medium" style={{ color: INK }}>{currency(p.revenue, true)}</td>
                      <td className="py-2.5 px-1 text-right">
                        <span className="inline-flex items-center gap-0.5 font-medium tabular-nums" style={{ color: p.growth >= 0 ? EMERALD : ROSE }}>
                          {p.growth >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                          {Math.abs(p.growth)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>

          <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_2px_rgba(16,26,51,0.04)] flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} color={NAVY} />
              <h3 className="text-sm font-semibold" style={{ color: INK }}>AI Insights &amp; Recommendations</h3>
            </div>
            <div className="flex flex-col gap-3 overflow-y-auto pr-1" style={{ maxHeight: 460 }}>
              {insights.map((ins) => {
                const style = PRIORITY_STYLE[ins.priority];
                const Icon = style.icon;
                return (
                  <div key={ins.id} className="border border-slate-200 rounded-lg p-3.5">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${style.badge}`}>
                        <Icon size={11} />
                        {ins.priority} priority
                      </span>
                    </div>
                    <p className="text-sm font-medium mb-1" style={{ color: INK }}>{ins.title}</p>
                    <p className="text-xs text-slate-500 leading-relaxed mb-2.5">{ins.recommendation}</p>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-slate-500">Business impact</span>
                      <span className="font-medium" style={{ color: INK }}>{ins.impact}</span>
                    </div>
                    <ConfidenceMeter value={ins.confidence} color={style.color} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_2px_rgba(16,26,51,0.04)]">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: INK }}>Recent Orders</h3>
              <p className="text-xs text-slate-500 mt-0.5">{filteredOrders.length} orders match current filters</p>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search orders, customers, products…"
                className="pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg w-72 focus:outline-none focus:ring-2 focus:border-slate-300 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500 border-b border-slate-200">
                  <th className="py-2 px-2 font-semibold">Order ID</th>
                  <th className="py-2 px-2 font-semibold">Customer</th>
                  <th className="py-2 px-2 font-semibold">Product</th>
                  <th className="py-2 px-2 font-semibold">Region</th>
                  <th className="py-2 px-2 font-semibold text-right">Quantity</th>
                  <th className="py-2 px-2 font-semibold text-right">Revenue</th>
                  <th className="py-2 px-2 font-semibold">Status</th>
                  <th className="py-2 px-2 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 text-sm">
                      No orders match the current filters. Try widening the date range or clearing a filter.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => (
                    <tr key={o.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="py-2.5 px-2 font-medium" style={{ color: NAVY }}>{o.id}</td>
                      <td className="py-2.5 px-2 text-slate-700">{o.customer}</td>
                      <td className="py-2.5 px-2 text-slate-600">{o.product}</td>
                      <td className="py-2.5 px-2 text-slate-600">{o.region}</td>
                      <td className="py-2.5 px-2 text-right tabular-nums text-slate-600">{number(o.quantity)}</td>
                      <td className="py-2.5 px-2 text-right tabular-nums font-medium" style={{ color: INK }}>{currency(o.revenue)}</td>
                      <td className="py-2.5 px-2">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[o.status]}`}>{o.status}</span>
                      </td>
                      <td className="py-2.5 px-2 text-slate-500">{new Date(o.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
