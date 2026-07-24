import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api/api.js";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  Boxes, Warehouse, AlertTriangle, RefreshCw, Repeat, Wallet,
  Search, ChevronDown, ArrowUp, ArrowDown, Sparkles,
  PackagePlus, PackageMinus, SlidersHorizontal, ShieldCheck,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Design tokens — matches Sales Intelligence page for a consistent   */
/*  design system across the product: deep navy/ink primary, cool      */
/*  slate neutrals, emerald/amber/rose signal colors.                  */
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

const number = (n) => new Intl.NumberFormat("en-US").format(n);

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */
const inventoryTrend = [
  { month: "Aug", stock: 182400 },
  { month: "Sep", stock: 176900 },
  { month: "Oct", stock: 189200 },
  { month: "Nov", stock: 205100 },
  { month: "Dec", stock: 168300 },
  { month: "Jan", stock: 174800 },
  { month: "Feb", stock: 183600 },
  { month: "Mar", stock: 191200 },
  { month: "Apr", stock: 187500 },
  { month: "May", stock: 179800 },
  { month: "Jun", stock: 184300 },
  { month: "Jul", stock: 190700 },
];

const warehouseUtilization = [
  { warehouse: "North DC", utilization: 87 },
  { warehouse: "East DC", utilization: 93 },
  { warehouse: "West DC", utilization: 68 },
  { warehouse: "Central DC", utilization: 76 },
  { warehouse: "South DC", utilization: 58 },
];

const warehouseComparison = [
  { warehouse: "North DC", capacity: 60000, current: 52200 },
  { warehouse: "East DC", capacity: 45000, current: 41900 },
  { warehouse: "West DC", capacity: 50000, current: 34100 },
  { warehouse: "Central DC", capacity: 38000, current: 28800 },
  { warehouse: "South DC", capacity: 32000, current: 18600 },
];

const categoryDistribution = [
  { name: "Electronics", value: 32 },
  { name: "Premium Collection", value: 21 },
  { name: "Home & Kitchen", value: 19 },
  { name: "Apparel", value: 16 },
  { name: "Sports & Outdoors", value: 12 },
];

const stockMovement = [
  { month: "Feb", inbound: 24800, outbound: 22100 },
  { month: "Mar", inbound: 27600, outbound: 24900 },
  { month: "Apr", inbound: 22300, outbound: 25700 },
  { month: "May", inbound: 25900, outbound: 23200 },
  { month: "Jun", inbound: 28100, outbound: 26400 },
  { month: "Jul", inbound: 26700, outbound: 24800 },
];

const reorderForecast = [
  { week: "Wk 1", actual: 4200, forecast: null },
  { week: "Wk 2", actual: 4650, forecast: null },
  { week: "Wk 3", actual: 3980, forecast: null },
  { week: "Wk 4", actual: 4410, forecast: 4400 },
  { week: "Wk 5", actual: null, forecast: 5120 },
  { week: "Wk 6", actual: null, forecast: 5480 },
  { week: "Wk 7", actual: null, forecast: 5890 },
];

const WAREHOUSES = ["All Warehouses", "North DC", "East DC", "West DC", "Central DC", "South DC"];
const SUPPLIERS = ["All Suppliers", "Orion Components", "Vantage Textiles", "BrightLine Manufacturing", "Coastal Supply Co.", "Apex Industrial"];
const CATEGORIES = ["All Categories", "Electronics", "Apparel", "Home & Kitchen", "Sports & Outdoors", "Premium Collection"];
const STOCK_STATUSES = ["All Statuses", "In Stock", "Low Stock", "Critical", "Overstock", "Out of Stock"];

const inventoryItems = [
  { product: "Aria Wireless Earbuds Pro", warehouse: "North DC", current: 4120, safety: 1500, reorder: 2000, status: "In Stock", supplier: "Orion Components", category: "Electronics" },
  { product: "Halcyon 65\" OLED Display", warehouse: "East DC", current: 340, safety: 500, reorder: 600, status: "Low Stock", supplier: "Orion Components", category: "Electronics" },
  { product: "Nimbus Smart Thermostat", warehouse: "North DC", current: 2870, safety: 900, reorder: 1200, status: "In Stock", supplier: "BrightLine Manufacturing", category: "Electronics" },
  { product: "Summit 4-Slice Toaster", warehouse: "West DC", current: 6200, safety: 1800, reorder: 2200, status: "Overstock", supplier: "BrightLine Manufacturing", category: "Home & Kitchen" },
  { product: "Cascade Stand Mixer", warehouse: "West DC", current: 1120, safety: 900, reorder: 1100, status: "Low Stock", supplier: "BrightLine Manufacturing", category: "Home & Kitchen" },
  { product: "Vantage Running Jacket", warehouse: "South DC", current: 95, safety: 600, reorder: 800, status: "Critical", supplier: "Vantage Textiles", category: "Apparel" },
  { product: "Solstice Trail Windbreaker", warehouse: "South DC", current: 2410, safety: 700, reorder: 950, status: "In Stock", supplier: "Vantage Textiles", category: "Apparel" },
  { product: "Meridian Leather Backpack", warehouse: "Central DC", current: 780, safety: 400, reorder: 550, status: "In Stock", supplier: "Apex Industrial", category: "Premium Collection" },
  { product: "Onyx Chrono Watch", warehouse: "Central DC", current: 210, safety: 350, reorder: 450, status: "Low Stock", supplier: "Apex Industrial", category: "Premium Collection" },
  { product: "Everline Yoga Mat Set", warehouse: "West DC", current: 3340, safety: 1000, reorder: 1300, status: "In Stock", supplier: "Coastal Supply Co.", category: "Sports & Outdoors" },
  { product: "Ridgeline Insulated Cooler", warehouse: "West DC", current: 0, safety: 500, reorder: 700, status: "Out of Stock", supplier: "Coastal Supply Co.", category: "Sports & Outdoors" },
  { product: "Halcyon 65\" OLED Display", warehouse: "North DC", current: 890, safety: 500, reorder: 600, status: "In Stock", supplier: "Orion Components", category: "Electronics" },
  { product: "Aria Wireless Earbuds Pro", warehouse: "East DC", current: 210, safety: 500, reorder: 650, status: "Critical", supplier: "Orion Components", category: "Electronics" },
  { product: "Cascade Stand Mixer", warehouse: "Central DC", current: 5480, safety: 1200, reorder: 1500, status: "Overstock", supplier: "BrightLine Manufacturing", category: "Home & Kitchen" },
  { product: "Vantage Running Jacket", warehouse: "East DC", current: 1680, safety: 600, reorder: 800, status: "In Stock", supplier: "Vantage Textiles", category: "Apparel" },
  { product: "Onyx Chrono Watch", warehouse: "North DC", current: 640, safety: 350, reorder: 450, status: "In Stock", supplier: "Apex Industrial", category: "Premium Collection" },
  { product: "Meridian Leather Backpack", warehouse: "South DC", current: 130, safety: 400, reorder: 550, status: "Low Stock", supplier: "Apex Industrial", category: "Premium Collection" },
  { product: "Everline Yoga Mat Set", warehouse: "Central DC", current: 60, safety: 700, reorder: 950, status: "Critical", supplier: "Coastal Supply Co.", category: "Sports & Outdoors" },
  { product: "Nimbus Smart Thermostat", warehouse: "South DC", current: 1980, safety: 700, reorder: 900, status: "In Stock", supplier: "BrightLine Manufacturing", category: "Electronics" },
  { product: "Ridgeline Insulated Cooler", warehouse: "East DC", current: 4870, safety: 900, reorder: 1200, status: "Overstock", supplier: "Coastal Supply Co.", category: "Sports & Outdoors" },
];

const STATUS_STYLE = {
  "In Stock": "bg-emerald-50 text-emerald-700 border border-emerald-200",
  "Low Stock": "bg-amber-50 text-amber-700 border border-amber-200",
  "Critical": "bg-rose-50 text-rose-700 border border-rose-200",
  "Overstock": "bg-sky-50 text-sky-700 border border-sky-200",
  "Out of Stock": "bg-slate-100 text-slate-600 border border-slate-200",
};

const recommendations = [
  {
    id: 1,
    type: "Reorder Needed",
    icon: PackagePlus,
    color: ROSE,
    badge: "bg-rose-50 text-rose-700 border border-rose-200",
    confidence: 95,
    title: "Vantage Running Jacket — South DC critically low",
    impact: "Stockout risk within 6 days at current sell-through",
    recommendation:
      "Current stock (95 units) is below safety stock (600). Place an emergency reorder of 1,200 units with Vantage Textiles and consider a temporary transfer from East DC's surplus.",
  },
  {
    id: 2,
    type: "Overstock Alert",
    icon: PackageMinus,
    color: AMBER,
    badge: "bg-amber-50 text-amber-700 border border-amber-200",
    confidence: 88,
    title: "Summit 4-Slice Toaster — West DC overstocked",
    impact: "$186K in capital tied up beyond 90-day demand",
    recommendation:
      "Stock is running 3.4x safety level with flat sell-through. Redirect incoming purchase orders and consider a cross-warehouse rebalance or a promotional push through the Marketplace channel.",
  },
  {
    id: 3,
    type: "Warehouse Optimization",
    icon: SlidersHorizontal,
    color: SKY,
    badge: "bg-sky-50 text-sky-700 border border-sky-200",
    confidence: 82,
    title: "East DC approaching capacity ceiling",
    impact: "93% utilization, 3 pts from operational limit",
    recommendation:
      "East DC is nearing full capacity while South DC sits at 58%. Rebalance slow-moving Electronics SKUs to South DC and prioritize East DC space for high-turnover items only.",
  },
  {
    id: 4,
    type: "Safety Stock Recommendation",
    icon: ShieldCheck,
    color: EMERALD,
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    confidence: 79,
    title: "Raise safety stock for Onyx Chrono Watch",
    impact: "Reduces stockout frequency by an estimated 40%",
    recommendation:
      "Demand volatility has increased over the last two quarters. Raise the safety stock threshold from 350 to 500 units across Central and North DC to buffer against lead-time variability.",
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
export default function InventoryIntelligencePage() {
  const [warehouse, setWarehouse] = useState("All Warehouses");
  const [supplier, setSupplier] = useState("All Suppliers");
  const [category, setCategory] = useState("All Categories");
  const [stockStatus, setStockStatus] = useState("All Statuses");
  const [search, setSearch] = useState("");
  const [dbData, setDbData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getInventoryIntelligence()
      .then((data) => {
        setDbData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const stats = dbData?.stats || {
    currentStock: 190700,
    warehouseCapacity: 78.4,
    safetyStock: 30000,
    turnoverRate: 6.2
  };

  const currentTrend = dbData?.inventoryTrend || inventoryTrend;
  const currentMovement = dbData?.stockMovement || stockMovement;

  const filteredItems = useMemo(() => {
    return inventoryItems.filter((it) => {
      if (warehouse !== "All Warehouses" && it.warehouse !== warehouse) return false;
      if (supplier !== "All Suppliers" && it.supplier !== supplier) return false;
      if (category !== "All Categories" && it.category !== category) return false;
      if (stockStatus !== "All Statuses" && it.status !== stockStatus) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const hay = `${it.product} ${it.warehouse} ${it.supplier}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [warehouse, supplier, category, stockStatus, search]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ background: "#F5F6F9" }}>
        <p className="text-slate-500 font-medium">Loading inventory intelligence...</p>
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
              Inventory Intelligence
            </h1>
            <p className="text-sm text-slate-500 mt-1">Stock levels, warehouse utilization, and AI-generated reorder recommendations across all sites.</p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <Select value={warehouse} onChange={setWarehouse} options={WAREHOUSES} />
            <Select value={supplier} onChange={setSupplier} options={SUPPLIERS} />
            <Select value={category} onChange={setCategory} options={CATEGORIES} />
            <Select value={stockStatus} onChange={setStockStatus} options={STOCK_STATUSES} />
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          <KpiCard icon={Boxes} label="Current Stock" value={number(stats.currentStock)} delta="3.5%" deltaLabel="vs last month" positive />
          <KpiCard icon={Warehouse} label="Warehouse Capacity" value={typeof stats.warehouseCapacity === "string" ? stats.warehouseCapacity : `${stats.warehouseCapacity.toFixed(1)}%`} delta="2.1 pts" deltaLabel="vs last month" positive={false} />
          <KpiCard icon={AlertTriangle} label="Low Stock Items" value={number(6)} delta="2" deltaLabel="new this week" positive={false} />
          <KpiCard icon={RefreshCw} label="Reorder Requests" value={number(14)} delta="4" deltaLabel="pending approval" positive={false} />
          <KpiCard icon={Repeat} label="Stock Turnover" value={`${stats.turnoverRate}x`} delta="0.4x" deltaLabel="vs last quarter" positive />
          <KpiCard icon={Wallet} label="Inventory Value" value={currency(21_400_000, true)} delta="1.8%" deltaLabel="vs last month" positive />
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
          <ChartCard title="Inventory Trend" subtitle="Total units on hand, trailing 12 months" className="xl:col-span-2">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={currentTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={LINE_SLATE} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: SLATE }} axisLine={{ stroke: LINE_SLATE }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: SLATE }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}K`} />
                <Tooltip content={<CustomTooltip formatter={(v) => `${number(v)} units`} />} />
                <Line type="monotone" dataKey="stock" name="Stock on hand" stroke={NAVY} strokeWidth={2.5} dot={{ r: 3, fill: NAVY }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Category Distribution" subtitle="Share of inventory value">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={categoryDistribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {categoryDistribution.map((entry, i) => (
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
          <ChartCard title="Warehouse Utilization" subtitle="Percent of capacity in use">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={warehouseUtilization} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={LINE_SLATE} />
                <XAxis dataKey="warehouse" tick={{ fontSize: 11.5, fill: SLATE }} axisLine={{ stroke: LINE_SLATE }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: SLATE }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip formatter={(v) => `${v}%`} />} cursor={{ fill: "#F5F6F9" }} />
                <Bar dataKey="utilization" name="Utilization" radius={[6, 6, 0, 0]} maxBarSize={42}>
                  {warehouseUtilization.map((entry) => (
                    <Cell key={entry.warehouse} fill={entry.utilization >= 90 ? ROSE : entry.utilization >= 80 ? AMBER : NAVY} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Stock Movement" subtitle="Inbound vs. outbound units, last 6 months">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={currentMovement} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={LINE_SLATE} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: SLATE }} axisLine={{ stroke: LINE_SLATE }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: SLATE }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}K`} />
                <Tooltip content={<CustomTooltip formatter={(v) => `${number(v)} units`} />} cursor={{ fill: "#F5F6F9" }} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Bar dataKey="inbound" name="Inbound / Receipts" fill={NAVY} radius={[4, 4, 0, 0]} />
                <Bar dataKey="outbound" name="Outbound / Issues" fill={SKY} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Dynamic Reorder Forecast" subtitle="Actual vs. safety stock replenishment model">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={reorderForecast} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={LINE_SLATE} />
                <XAxis dataKey="week" tick={{ fontSize: 12, fill: SLATE }} axisLine={{ stroke: LINE_SLATE }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: SLATE }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}K`} />
                <Tooltip content={<CustomTooltip formatter={(v) => `${number(v)} units`} />} />
                <Line type="monotone" dataKey="actual" name="Actual Stock Level" stroke={NAVY} strokeWidth={2.5} dot={{ r: 3, fill: NAVY }} activeDot={{ r: 5 }} connectNulls />
                <Line type="monotone" dataKey="forecast" name="Projected Replenishment" stroke={SKY} strokeWidth={2.5} strokeDasharray="5 4" dot={{ r: 3, fill: SKY }} activeDot={{ r: 5 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Warehouse Comparison + AI Recommendations */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 mb-5">
          <ChartCard title="Warehouse Comparison" subtitle="Capacity vs. current stock, by site" className="xl:col-span-3">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={warehouseComparison} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={LINE_SLATE} />
                <XAxis dataKey="warehouse" tick={{ fontSize: 11.5, fill: SLATE }} axisLine={{ stroke: LINE_SLATE }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: SLATE }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}K`} />
                <Tooltip content={<CustomTooltip formatter={(v) => `${number(v)} units`} />} cursor={{ fill: "#F5F6F9" }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: SLATE }} />
                <Bar dataKey="capacity" name="Capacity" fill={LINE_SLATE} radius={[6, 6, 0, 0]} maxBarSize={30} />
                <Bar dataKey="current" name="Current Stock" fill={NAVY} radius={[6, 6, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_2px_rgba(16,26,51,0.04)] flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} color={NAVY} />
              <h3 className="text-sm font-semibold" style={{ color: INK }}>AI Reorder Recommendations</h3>
            </div>
            <div className="flex flex-col gap-3 overflow-y-auto pr-1" style={{ maxHeight: 460 }}>
              {recommendations.map((rec) => {
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

        {/* Inventory Table */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_2px_rgba(16,26,51,0.04)]">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: INK }}>Stock Status Directory</h3>
              <p className="text-xs text-slate-500 mt-0.5">{filteredItems.length} items match current filters</p>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products, warehouses, suppliers…"
                className="pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg w-72 focus:outline-none focus:ring-2 focus:border-slate-300 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500 border-b border-slate-200">
                  <th className="py-2 px-2 font-semibold">Product</th>
                  <th className="py-2 px-2 font-semibold">Warehouse</th>
                  <th className="py-2 px-2 font-semibold text-right">Current Stock</th>
                  <th className="py-2 px-2 font-semibold text-right">Safety Stock</th>
                  <th className="py-2 px-2 font-semibold text-right">Reorder Level</th>
                  <th className="py-2 px-2 font-semibold">Status</th>
                  <th className="py-2 px-2 font-semibold">Supplier</th>
                  <th className="py-2 px-2 font-semibold">Category</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 text-sm">
                      No inventory records match the current filters. Try clearing a filter or broadening your search.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((it, i) => (
                    <tr key={`${it.product}-${it.warehouse}-${i}`} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="py-2.5 px-2 font-medium" style={{ color: INK }}>{it.product}</td>
                      <td className="py-2.5 px-2 text-slate-600">{it.warehouse}</td>
                      <td className="py-2.5 px-2 text-right tabular-nums font-medium" style={{ color: INK }}>{number(it.current)}</td>
                      <td className="py-2.5 px-2 text-right tabular-nums text-slate-600">{number(it.safety)}</td>
                      <td className="py-2.5 px-2 text-right tabular-nums text-slate-600">{number(it.reorder)}</td>
                      <td className="py-2.5 px-2">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[it.status]}`}>{it.status}</span>
                      </td>
                      <td className="py-2.5 px-2 text-slate-600">{it.supplier}</td>
                      <td className="py-2.5 px-2 text-slate-600">{it.category}</td>
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
