import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api/api.js";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  Truck, PackageCheck, Clock, Wallet, Timer, Gauge,
  Search, ChevronDown, ArrowUp, ArrowDown, AlertTriangle, Sparkles,
  Warehouse, RouteOff, Fuel,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Design tokens — matches Sales / Inventory / Finance Intelligence    */
/*  pages for a consistent design system: deep navy/ink primary, cool  */
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
const shipmentTrend = [
  { month: "Aug", shipments: 5240 },
  { month: "Sep", shipments: 5480 },
  { month: "Oct", shipments: 5910 },
  { month: "Nov", shipments: 6720 },
  { month: "Dec", shipments: 8140 },
  { month: "Jan", shipments: 6380 },
  { month: "Feb", shipments: 6010 },
  { month: "Mar", shipments: 6340 },
  { month: "Apr", shipments: 6580 },
  { month: "May", shipments: 6790 },
  { month: "Jun", shipments: 7020 },
  { month: "Jul", shipments: 7240 },
];

const deliveryPerformance = [
  { month: "Feb", onTime: 91.2, delayed: 8.8 },
  { month: "Mar", onTime: 92.4, delayed: 7.6 },
  { month: "Apr", onTime: 90.8, delayed: 9.2 },
  { month: "May", onTime: 93.1, delayed: 6.9 },
  { month: "Jun", onTime: 94.0, delayed: 6.0 },
  { month: "Jul", onTime: 93.6, delayed: 6.4 },
];

const transportationCost = [
  { month: "Feb", cost: 412000 },
  { month: "Mar", cost: 438000 },
  { month: "Apr", cost: 421000 },
  { month: "May", cost: 456000 },
  { month: "Jun", cost: 447000 },
  { month: "Jul", cost: 463000 },
];

const etaAccuracy = [
  { week: "Wk 1", accuracy: 88.4 },
  { week: "Wk 2", accuracy: 90.1 },
  { week: "Wk 3", accuracy: 89.6 },
  { week: "Wk 4", accuracy: 91.8 },
  { week: "Wk 5", accuracy: 92.4 },
  { week: "Wk 6", accuracy: 93.0 },
];

const warehouseShipments = [
  { warehouse: "North DC", shipments: 2140 },
  { warehouse: "East DC", shipments: 1890 },
  { warehouse: "West DC", shipments: 1420 },
  { warehouse: "Central DC", shipments: 1080 },
  { warehouse: "South DC", shipments: 710 },
];

const vehicleUtilization = [
  { name: "Truck – Standard", value: 38 },
  { name: "Van – Last Mile", value: 26 },
  { name: "Truck – Refrigerated", value: 18 },
  { name: "Rail Freight", value: 12 },
  { name: "Air Freight", value: 6 },
];

const WAREHOUSES = ["All Warehouses", "North DC", "East DC", "West DC", "Central DC", "South DC"];
const REGIONS = ["All Regions", "North", "South", "East", "West", "Central"];
const VEHICLES = ["All Vehicles", "Truck – Standard", "Truck – Refrigerated", "Van – Last Mile", "Rail Freight", "Air Freight"];
const DELIVERY_STATUSES = ["All Statuses", "Delivered", "In Transit", "Out for Delivery", "Delayed", "Pending Dispatch"];

const STATUS_STYLE = {
  Delivered: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  "In Transit": "bg-sky-50 text-sky-700 border border-sky-200",
  "Out for Delivery": "bg-violet-50 text-violet-700 border border-violet-200",
  Delayed: "bg-rose-50 text-rose-700 border border-rose-200",
  "Pending Dispatch": "bg-slate-100 text-slate-600 border border-slate-200",
};

const shipments = [
  { shipmentId: "SHP-71042", orderId: "ORD-48291", warehouse: "East DC", destination: "Richmond, VA", region: "East", vehicle: "Truck – Standard", eta: "2026-07-24", status: "In Transit", cost: 1240, delay: 0 },
  { shipmentId: "SHP-71039", orderId: "ORD-48290", warehouse: "North DC", destination: "Buffalo, NY", region: "North", vehicle: "Van – Last Mile", eta: "2026-07-23", status: "Delivered", cost: 340, delay: 0 },
  { shipmentId: "SHP-71035", orderId: "ORD-48288", warehouse: "West DC", destination: "Sacramento, CA", region: "West", vehicle: "Truck – Standard", eta: "2026-07-25", status: "Delayed", cost: 980, delay: 2 },
  { shipmentId: "SHP-71031", orderId: "ORD-48285", warehouse: "South DC", destination: "Baton Rouge, LA", region: "South", vehicle: "Truck – Refrigerated", eta: "2026-07-24", status: "In Transit", cost: 1560, delay: 0 },
  { shipmentId: "SHP-71028", orderId: "ORD-48280", warehouse: "Central DC", destination: "Wichita, KS", region: "Central", vehicle: "Van – Last Mile", eta: "2026-07-22", status: "Delivered", cost: 260, delay: 0 },
  { shipmentId: "SHP-71024", orderId: "ORD-48277", warehouse: "East DC", destination: "Charlotte, NC", region: "East", vehicle: "Rail Freight", eta: "2026-07-26", status: "In Transit", cost: 2140, delay: 0 },
  { shipmentId: "SHP-71019", orderId: "ORD-48271", warehouse: "West DC", destination: "Portland, OR", region: "West", vehicle: "Truck – Standard", eta: "2026-07-23", status: "Delayed", cost: 1120, delay: 1 },
  { shipmentId: "SHP-71014", orderId: "ORD-48266", warehouse: "North DC", destination: "Albany, NY", region: "North", vehicle: "Van – Last Mile", eta: "2026-07-22", status: "Out for Delivery", cost: 310, delay: 0 },
  { shipmentId: "SHP-71009", orderId: "ORD-48260", warehouse: "South DC", destination: "Mobile, AL", region: "South", vehicle: "Truck – Standard", eta: "2026-07-27", status: "Pending Dispatch", cost: 1040, delay: 0 },
  { shipmentId: "SHP-71003", orderId: "ORD-48254", warehouse: "Central DC", destination: "Omaha, NE", region: "Central", vehicle: "Air Freight", eta: "2026-07-23", status: "Delivered", cost: 3120, delay: 0 },
  { shipmentId: "SHP-70998", orderId: "ORD-48249", warehouse: "North DC", destination: "Rochester, NY", region: "North", vehicle: "Truck – Standard", eta: "2026-07-24", status: "In Transit", cost: 1180, delay: 0 },
  { shipmentId: "SHP-70992", orderId: "ORD-48241", warehouse: "Central DC", destination: "Tulsa, OK", region: "Central", vehicle: "Van – Last Mile", eta: "2026-07-21", status: "Delayed", cost: 290, delay: 3 },
  { shipmentId: "SHP-70987", orderId: "ORD-48233", warehouse: "West DC", destination: "Fresno, CA", region: "West", vehicle: "Truck – Refrigerated", eta: "2026-07-25", status: "In Transit", cost: 1470, delay: 0 },
  { shipmentId: "SHP-70981", orderId: "ORD-48228", warehouse: "East DC", destination: "Norfolk, VA", region: "East", vehicle: "Truck – Standard", eta: "2026-07-22", status: "Delivered", cost: 1090, delay: 0 },
  { shipmentId: "SHP-70975", orderId: "ORD-48219", warehouse: "South DC", destination: "Shreveport, LA", region: "South", vehicle: "Van – Last Mile", eta: "2026-07-20", status: "Delivered", cost: 275, delay: 0 },
  { shipmentId: "SHP-70969", orderId: "ORD-48210", warehouse: "West DC", destination: "Boise, ID", region: "West", vehicle: "Rail Freight", eta: "2026-07-28", status: "Pending Dispatch", cost: 1980, delay: 0 },
  { shipmentId: "SHP-70962", orderId: "ORD-48198", warehouse: "North DC", destination: "Syracuse, NY", region: "North", vehicle: "Truck – Standard", eta: "2026-07-19", status: "Delivered", cost: 1150, delay: 0 },
  { shipmentId: "SHP-70956", orderId: "ORD-48187", warehouse: "Central DC", destination: "Des Moines, IA", region: "Central", vehicle: "Van – Last Mile", eta: "2026-07-18", status: "Delayed", cost: 305, delay: 1 },
  { shipmentId: "SHP-70949", orderId: "ORD-48172", warehouse: "South DC", destination: "Jackson, MS", region: "South", vehicle: "Truck – Standard", eta: "2026-07-16", status: "Delivered", cost: 1020, delay: 0 },
  { shipmentId: "SHP-70941", orderId: "ORD-48160", warehouse: "East DC", destination: "Greensboro, NC", region: "East", vehicle: "Truck – Refrigerated", eta: "2026-07-14", status: "Delivered", cost: 1380, delay: 0 },
];

const recommendations = [
  {
    id: 1,
    type: "Recommended Warehouse Assignment",
    icon: Warehouse,
    color: SKY,
    badge: "bg-sky-50 text-sky-700 border border-sky-200",
    confidence: 85,
    title: "Route West Coast orders through West DC, not Central",
    impact: "Est. 1.1 day reduction in average transit time",
    recommendation:
      "18% of West region orders are currently fulfilled from Central DC, adding unnecessary transit distance. Reassign West-bound order routing rules to prioritize West DC when stock allows.",
  },
  {
    id: 2,
    type: "Delivery Delay Analysis",
    icon: Clock,
    color: ROSE,
    badge: "bg-rose-50 text-rose-700 border border-rose-200",
    confidence: 90,
    title: "West DC truck lane driving most delays",
    impact: "62% of this month's delays trace to one lane",
    recommendation:
      "Standard truck shipments from West DC to Pacific Northwest destinations show the highest delay concentration, largely tied to a single carrier. Evaluate a secondary carrier for that lane.",
  },
  {
    id: 3,
    type: "Route Optimization",
    icon: RouteOff,
    color: AMBER,
    badge: "bg-amber-50 text-amber-700 border border-amber-200",
    confidence: 79,
    title: "Consolidate last-mile van routes in North region",
    impact: "Est. 9% reduction in last-mile miles driven",
    recommendation:
      "Van – Last Mile routes in the North region overlap significantly across three delivery zones. Consolidating stops into shared routes could reduce mileage without adding delivery windows.",
  },
  {
    id: 4,
    type: "Transportation Cost Reduction",
    icon: Fuel,
    color: EMERALD,
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    confidence: 82,
    title: "Shift eligible Air Freight shipments to Rail",
    impact: "Est. $46K/month in freight cost savings",
    recommendation:
      "About a third of current Air Freight shipments have delivery windows wide enough to move via Rail Freight at a fraction of the cost with minimal service impact. Update routing rules for non-urgent orders.",
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
export default function LogisticsIntelligencePage() {
  const [warehouse, setWarehouse] = useState("All Warehouses");
  const [region, setRegion] = useState("All Regions");
  const [vehicle, setVehicle] = useState("All Vehicles");
  const [status, setStatus] = useState("All Statuses");
  const [search, setSearch] = useState("");
  const [dbData, setDbData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getLogisticsIntelligence()
      .then((data) => {
        setDbData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const stats = dbData?.stats || {
    totalShipments: 1342,
    onTimeRate: 93.6,
    avgTransitHours: 14.5,
    totalLogisticsCost: 463000
  };

  const currentShipments = dbData?.shipments || shipments;
  const currentSuppliers = dbData?.suppliers || [];

  const filteredShipments = useMemo(() => {
    return currentShipments.filter((s) => {
      // Map properties back if needed (carrier -> vehicle)
      const sVehicle = s.carrier || s.vehicle;
      const sWarehouse = s.warehouseId || s.warehouse;
      if (warehouse !== "All Warehouses" && sWarehouse !== warehouse) return false;
      if (vehicle !== "All Vehicles" && sVehicle !== vehicle) return false;
      if (status !== "All Statuses" && s.status !== status) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const hay = `${s.id || s.shipmentId} ${s.orderId || ''} ${s.destination || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [warehouse, vehicle, status, search, currentShipments]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ background: "#F5F6F9" }}>
        <p className="text-slate-500 font-medium">Loading logistics intelligence...</p>
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
              Logistics Intelligence
            </h1>
            <p className="text-sm text-slate-500 mt-1">Shipments, warehouse operations, and delivery performance across the network.</p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <Select value={warehouse} onChange={setWarehouse} options={WAREHOUSES} />
            <Select value={region} onChange={setRegion} options={REGIONS} />
            <Select value={vehicle} onChange={setVehicle} options={VEHICLES} />
            <Select value={status} onChange={setStatus} options={DELIVERY_STATUSES} />
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          <KpiCard icon={Truck} label="Active Shipments" value={number(stats.totalShipments)} delta="4.6%" deltaLabel="vs last week" positive />
          <KpiCard icon={PackageCheck} label="Completed Deliveries" value={number(7240)} delta="3.1%" deltaLabel="vs last month" positive />
          <KpiCard icon={AlertTriangle} label="Delayed Shipments" value={number(86)} delta="0.4 pts" deltaLabel="vs last month" positive={false} />
          <KpiCard icon={Wallet} label="Transportation Cost" value={currency(stats.totalLogisticsCost, true)} delta="3.6%" deltaLabel="vs last month" positive={false} />
          <KpiCard icon={Timer} label="Avg. Transit Hours" value={`${stats.avgTransitHours.toFixed(1)}h`} delta="0.2 days" deltaLabel="vs last month" positive />
          <KpiCard icon={Gauge} label="On-Time Delivery Rate" value={`${stats.onTimeRate.toFixed(1)}%`} delta="0.4 pts" deltaLabel="vs last month" positive={false} />
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
          <ChartCard title="Shipment Trend" subtitle="Total shipments dispatched, trailing 12 months" className="xl:col-span-2">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={shipmentTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={LINE_SLATE} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: SLATE }} axisLine={{ stroke: LINE_SLATE }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: SLATE }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}K`} />
                <Tooltip content={<CustomTooltip formatter={(v) => `${number(v)} shipments`} />} />
                <Line type="monotone" dataKey="shipments" name="Shipments" stroke={NAVY} strokeWidth={2.5} dot={{ r: 3, fill: NAVY }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Vehicle Utilization" subtitle="Share of shipment volume by vehicle type">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={vehicleUtilization} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {vehicleUtilization.map((entry, i) => (
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
          <ChartCard title="Delivery Performance" subtitle="On-time vs. delayed share, last 6 months">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={deliveryPerformance} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={LINE_SLATE} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: SLATE }} axisLine={{ stroke: LINE_SLATE }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: SLATE }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip formatter={(v) => `${v}%`} />} cursor={{ fill: "#F5F6F9" }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: SLATE }} />
                <Bar dataKey="onTime" name="On-Time" stackId="a" fill={EMERALD} radius={[0, 0, 0, 0]} maxBarSize={30} />
                <Bar dataKey="delayed" name="Delayed" stackId="a" fill={ROSE} radius={[6, 6, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Transportation Cost" subtitle="Total freight cost, $, last 6 months">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={transportationCost} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="costFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={AMBER} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={AMBER} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke={LINE_SLATE} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: SLATE }} axisLine={{ stroke: LINE_SLATE }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: SLATE }} axisLine={false} tickLine={false} tickFormatter={(v) => currency(v, true)} />
                <Tooltip content={<CustomTooltip formatter={(v) => currency(v)} />} />
                <Area type="monotone" dataKey="cost" name="Cost" stroke={AMBER} strokeWidth={2.5} fill="url(#costFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="ETA Accuracy" subtitle="Predicted vs. actual arrival match rate">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={etaAccuracy} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={LINE_SLATE} />
                <XAxis dataKey="week" tick={{ fontSize: 12, fill: SLATE }} axisLine={{ stroke: LINE_SLATE }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: SLATE }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} domain={[80, 100]} />
                <Tooltip content={<CustomTooltip formatter={(v) => `${v}%`} />} />
                <Line type="monotone" dataKey="accuracy" name="ETA Accuracy" stroke={SKY} strokeWidth={2.5} dot={{ r: 3, fill: SKY }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Warehouse Shipments + AI Recommendations */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 mb-5">
          <ChartCard title="Warehouse Shipments" subtitle="Shipment volume by origin warehouse, current quarter" className="xl:col-span-3">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={warehouseShipments} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid horizontal={false} stroke={LINE_SLATE} />
                <XAxis type="number" tick={{ fontSize: 12, fill: SLATE }} axisLine={false} tickLine={false} tickFormatter={(v) => number(v)} />
                <YAxis type="category" dataKey="warehouse" tick={{ fontSize: 11.5, fill: SLATE }} axisLine={false} tickLine={false} width={90} />
                <Tooltip content={<CustomTooltip formatter={(v) => `${number(v)} shipments`} />} cursor={{ fill: "#F5F6F9" }} />
                <Bar dataKey="shipments" name="Shipments" fill={NAVY} radius={[0, 6, 6, 0]} maxBarSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_2px_rgba(16,26,51,0.04)] flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} color={NAVY} />
              <h3 className="text-sm font-semibold" style={{ color: INK }}>AI Recommendations</h3>
            </div>
            <div className="flex flex-col gap-3 overflow-y-auto pr-1" style={{ maxHeight: 500 }}>
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
                      <span className="font-medium text-right" style={{ color: INK }}>{rec.impact}</span>
                    </div>
                    <ConfidenceMeter value={rec.confidence} color={rec.color} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Shipment Table */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_2px_rgba(16,26,51,0.04)]">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: INK }}>Shipments</h3>
              <p className="text-xs text-slate-500 mt-0.5">{filteredShipments.length} shipments match current filters</p>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search shipment ID, order ID, destination…"
                className="pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg w-80 focus:outline-none focus:ring-2 focus:border-slate-300 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1000px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500 border-b border-slate-200">
                  <th className="py-2 px-2 font-semibold">Shipment ID</th>
                  <th className="py-2 px-2 font-semibold">Order ID</th>
                  <th className="py-2 px-2 font-semibold">Warehouse</th>
                  <th className="py-2 px-2 font-semibold">Destination</th>
                  <th className="py-2 px-2 font-semibold">Vehicle</th>
                  <th className="py-2 px-2 font-semibold">ETA</th>
                  <th className="py-2 px-2 font-semibold">Delivery Status</th>
                  <th className="py-2 px-2 font-semibold text-right">Cost</th>
                  <th className="py-2 px-2 font-semibold text-right">Delay</th>
                </tr>
              </thead>
              <tbody>
                {filteredShipments.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400 text-sm">
                      No shipments match the current filters. Try clearing a filter or broadening your search.
                    </td>
                  </tr>
                ) : (
                  filteredShipments.map((s) => (
                    <tr key={s.id || s.shipmentId} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="py-2.5 px-2 font-medium" style={{ color: NAVY }}>{s.id || s.shipmentId}</td>
                      <td className="py-2.5 px-2 text-slate-600">{s.orderId || '—'}</td>
                      <td className="py-2.5 px-2 text-slate-600">{s.warehouseId || s.warehouse || '—'}</td>
                      <td className="py-2.5 px-2 text-slate-700">{s.destination}</td>
                      <td className="py-2.5 px-2 text-slate-600">{s.carrier || s.vehicle}</td>
                      <td className="py-2.5 px-2 text-slate-500">{s.eta || '10h'}</td>
                      <td className="py-2.5 px-2">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[s.status]}`}>{s.status}</span>
                      </td>
                      <td className="py-2.5 px-2 text-right tabular-nums font-medium" style={{ color: INK }}>{currency(s.cost)}</td>
                      <td className="py-2.5 px-2 text-right tabular-nums">
                        {s.delay && parseFloat(s.delay) > 0 ? (
                          <span className="font-medium" style={{ color: ROSE }}>{s.delay}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
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
