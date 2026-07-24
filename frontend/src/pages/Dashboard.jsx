import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, Truck, Package, 
  Cpu, Activity, ShieldAlert, ArrowUpRight, ChevronRight, RefreshCw, 
  CheckCircle2, Clock, Layers, ExternalLink
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, Tooltip, CartesianGrid, Cell, PieChart, Pie 
} from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const [hoveredChart, setHoveredChart] = useState(null);

  // Mock Data for Charts
  const revenueTrendData = [
    { month: 'Jan', value: 42000 },
    { month: 'Feb', value: 48000 },
    { month: 'Mar', value: 51000 },
    { month: 'Apr', value: 56000 },
    { month: 'May', value: 62000 },
    { month: 'Jun', value: 74200 }
  ];

  const salesTrendData = [
    { category: 'Enterprise', sales: 34000 },
    { category: 'Mid-Market', sales: 24000 },
    { category: 'SMB', sales: 18000 },
    { category: 'Partner', sales: 12000 }
  ];

  const inventoryStatusData = [
    { name: 'In Stock', value: 65, color: '#10B981' },
    { name: 'Low Stock', value: 20, color: '#F59E0B' },
    { name: 'Out of Stock', value: 15, color: '#EF4444' }
  ];

  const budgetVsExpenseData = [
    { dept: 'R&D', budget: 50000, expense: 42000 },
    { dept: 'Sales', budget: 40000, expense: 38000 },
    { dept: 'Ops', budget: 30000, expense: 31000 },
    { dept: 'Marketing', budget: 25000, expense: 22000 }
  ];

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: '$2.48M',
      growth: '+14.2%',
      isPositive: true,
      icon: DollarSign,
      route: '/sales-intelligence',
      lastUpdated: '2 mins ago',
      trendData: [40, 42, 45, 50, 48, 55, 60]
    },
    {
      title: 'Net Profit',
      value: '$842K',
      growth: '+8.1%',
      isPositive: true,
      icon: TrendingUp,
      route: '/finance-intelligence',
      lastUpdated: '5 mins ago',
      trendData: [20, 22, 21, 25, 28, 30, 32]
    },
    {
      title: 'Current Orders',
      value: '1,428',
      growth: '+23.5%',
      isPositive: true,
      icon: ShoppingCart,
      route: '/sales-intelligence',
      lastUpdated: 'Just now',
      trendData: [10, 15, 18, 22, 20, 25, 30]
    },
    {
      title: 'Active Shipments',
      value: '384',
      growth: '-2.4%',
      isPositive: false,
      icon: Truck,
      route: '/logistics-intelligence',
      lastUpdated: '10 mins ago',
      trendData: [30, 28, 26, 29, 25, 24, 22]
    },
    {
      title: 'Inventory Health',
      value: '91.4%',
      growth: '+1.2%',
      isPositive: true,
      icon: Package,
      route: '/inventory-intelligence',
      lastUpdated: '1 hour ago',
      trendData: [85, 87, 86, 89, 90, 91, 91.4]
    },
    {
      title: 'AI Confidence Score',
      value: '98.7%',
      growth: '+0.5%',
      isPositive: true,
      icon: Cpu,
      route: '/agents',
      lastUpdated: 'Real-time',
      trendData: [95, 96, 96, 97, 98, 98, 98.7]
    }
  ];

  const enterpriseStatus = [
    { name: 'Sales', status: 'Healthy', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', desc: 'Surging quarterly targets', updated: '10m ago', route: '/sales-intelligence' },
    { name: 'Inventory', status: 'Low Stock', color: 'text-amber-700 bg-amber-50 border-amber-200', desc: 'SKU-892 threshold breach', updated: '25m ago', route: '/inventory-intelligence' },
    { name: 'Finance', status: 'Budget Stable', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', desc: 'Q3 margins within bounds', updated: '1h ago', route: '/finance-intelligence' },
    { name: 'Logistics', status: 'Delivery Delay', color: 'text-rose-700 bg-rose-50 border-rose-200', desc: 'Route 7 weather bottleneck', updated: '3m ago', route: '/logistics-intelligence' },
    { name: 'Warehouse', status: 'Normal', color: 'text-blue-700 bg-blue-50 border-blue-200', desc: 'Throughput at 94% capacity', updated: '12m ago', route: '/inventory-intelligence' }
  ];

  const criticalAlerts = [
    { id: 1, title: 'Low Stock Warning: SKU-892 Component Alpha', priority: 'High', department: 'Inventory', time: '10m ago', route: '/inventory-intelligence' },
    { id: 2, title: 'Shipment Delay on Route #409 (Weather Interruption)', priority: 'Medium', department: 'Logistics', time: '25m ago', route: '/logistics-intelligence' },
    { id: 3, title: 'Budget Threshold Warning: Marketing Q3 Allocation', priority: 'High', department: 'Finance', time: '1h ago', route: '/finance-intelligence' }
  ];

  const recentAiDecisions = [
    { decision: 'Auto-rerouted freight via Hub B to bypass storm corridor', department: 'Logistics', confidence: '99.2%', status: 'Executed', time: '4m ago' },
    { decision: 'Adjusted dynamic pricing tier for Enterprise accounts', department: 'Sales', confidence: '96.8%', status: 'Pending Review', time: '18m ago' },
    { decision: 'Triggered automated purchase order for SKU-892', department: 'Inventory', confidence: '98.4%', status: 'Executed', time: '42m ago' },
    { decision: 'Reallocated cloud infrastructure spend to reduce server overhead', department: 'Finance', confidence: '95.1%', status: 'Executed', time: '1h ago' }
  ];

  const recentActivities = [
    { title: 'Sales Order Created', desc: 'Enterprise deal #SO-2026-901 closed', time: '5m ago', route: '/sales-intelligence' },
    { title: 'Shipment Dispatched', desc: 'Batch #LOG-884 cleared customs', time: '14m ago', route: '/logistics-intelligence' },
    { title: 'Inventory Updated', desc: 'Warehouse West restocked 5,000 units', time: '30m ago', route: '/inventory-intelligence' },
    { title: 'Budget Approved', desc: 'Q3 R&D expansion tranche unlocked', time: '1h ago', route: '/finance-intelligence' },
    { title: 'Warehouse Stock Received', desc: 'Incoming freight intake processed', time: '2h ago', route: '/inventory-intelligence' }
  ];

  return (
    <div className="p-8 space-y-8 bg-slate-50 text-slate-800 min-h-screen font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* HEADER COMMAND CENTER INTRO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-semibold tracking-wider uppercase mb-1">
            <Layers className="w-3.5 h-3.5" /> Enterprise Decision Intelligence Platform
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Executive Command Center</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm text-xs font-medium text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Enterprise Telemetry
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 shadow-sm text-xs font-medium text-slate-700 transition-all duration-200"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" /> Sync Data
          </button>
        </div>
      </div>

      {/* TOP KPI SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((kpi, idx) => {
          const IconComponent = kpi.icon;
          return (
            <div
              key={idx}
              onClick={() => navigate(kpi.route)}
              className="group relative bg-white border border-slate-200/80 rounded-2xl p-4 hover:border-indigo-500 hover:shadow-md transition-all duration-300 cursor-pointer shadow-sm hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 group-hover:scale-110 transition-transform duration-300">
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${kpi.isPositive ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-rose-700 bg-rose-50 border border-rose-200'}`}>
                  {kpi.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {kpi.growth}
                </div>
              </div>
              
              <div className="text-slate-500 text-xs font-medium mb-1">{kpi.title}</div>
              <div className="text-2xl font-bold tracking-tight text-slate-900 mb-3">{kpi.value}</div>

              {/* Mini Sparkline Chart */}
              <div className="h-8 w-full mb-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={kpi.trendData.map((val, i) => ({ val }))}>
                    <Line 
                      type="monotone" 
                      dataKey="val" 
                      stroke={kpi.isPositive ? '#10B981' : '#F43F5E'} 
                      strokeWidth={2} 
                      dot={false} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                <span>Updated {kpi.lastUpdated}</span>
                <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          );
        })}
      </div>

      {/* MAIN ANALYTICS & SIDEBAR GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* MAIN ANALYTICS SECTION (2 Columns width) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Revenue Trend */}
            <div 
              onMouseEnter={() => setHoveredChart('Revenue Trend')}
              onMouseLeave={() => setHoveredChart(null)}
              onClick={() => navigate('/sales-intelligence')}
              className="group relative bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-indigo-500 hover:shadow-md transition-all duration-300 cursor-pointer shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">Revenue Trend</h3>
                  <p className="text-xs text-slate-500">Monthly performance tracking</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 text-slate-500 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
                  <ExternalLink className="w-4 h-4" />
                </div>
              </div>

              {hoveredChart === 'Revenue Trend' && (
                <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 px-3 py-1 bg-slate-900 border border-slate-700 text-white text-xs rounded-lg shadow-xl pointer-events-none animate-fadeIn">
                  Click to view detailed analytics
                </div>
              )}

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '0.75rem', color: '#0F172A', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={3} dot={{ fill: '#6366F1', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sales Trend */}
            <div 
              onMouseEnter={() => setHoveredChart('Sales Trend')}
              onMouseLeave={() => setHoveredChart(null)}
              onClick={() => navigate('/sales-intelligence')}
              className="group relative bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-indigo-500 hover:shadow-md transition-all duration-300 cursor-pointer shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">Sales Trend</h3>
                  <p className="text-xs text-slate-500">Distribution by segment</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 text-slate-500 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
                  <ExternalLink className="w-4 h-4" />
                </div>
              </div>

              {hoveredChart === 'Sales Trend' && (
                <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 px-3 py-1 bg-slate-900 border border-slate-700 text-white text-xs rounded-lg shadow-xl pointer-events-none animate-fadeIn">
                  Click to view detailed analytics
                </div>
              )}

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="category" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '0.75rem', color: '#0F172A', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="sales" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Inventory Status */}
            <div 
              onMouseEnter={() => setHoveredChart('Inventory Status')}
              onMouseLeave={() => setHoveredChart(null)}
              onClick={() => navigate('/inventory-intelligence')}
              className="group relative bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-indigo-500 hover:shadow-md transition-all duration-300 cursor-pointer shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">Inventory Status</h3>
                  <p className="text-xs text-slate-500">Stock health distribution</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 text-slate-500 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
                  <ExternalLink className="w-4 h-4" />
                </div>
              </div>

              {hoveredChart === 'Inventory Status' && (
                <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 px-3 py-1 bg-slate-900 border border-slate-700 text-white text-xs rounded-lg shadow-xl pointer-events-none animate-fadeIn">
                  Click to view detailed analytics
                </div>
              )}

              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={inventoryStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {inventoryStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '0.75rem', color: '#0F172A', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Budget vs Expense */}
            <div 
              onMouseEnter={() => setHoveredChart('Budget vs Expense')}
              onMouseLeave={() => setHoveredChart(null)}
              onClick={() => navigate('/finance-intelligence')}
              className="group relative bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-indigo-500 hover:shadow-md transition-all duration-300 cursor-pointer shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">Budget vs Expense</h3>
                  <p className="text-xs text-slate-500">Departmental allocation overview</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 text-slate-500 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
                  <ExternalLink className="w-4 h-4" />
                </div>
              </div>

              {hoveredChart === 'Budget vs Expense' && (
                <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 px-3 py-1 bg-slate-900 border border-slate-700 text-white text-xs rounded-lg shadow-xl pointer-events-none animate-fadeIn">
                  Click to view detailed analytics
                </div>
              )}

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={budgetVsExpenseData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="dept" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '0.75rem', color: '#0F172A', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="budget" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" fill="#EC4899" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT SIDE PANEL: CURRENT ENTERPRISE STATUS */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" /> Current Enterprise Status
              </h3>
              <span className="text-xs text-slate-400">Real-time</span>
            </div>

            <div className="space-y-3">
              {enterpriseStatus.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => navigate(item.route)}
                  className="group flex items-center justify-between p-3 rounded-xl bg-slate-50/60 border border-slate-100 hover:border-slate-300 hover:bg-slate-100/50 transition-all duration-200 cursor-pointer shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-slate-800 group-hover:text-indigo-600 transition-colors">
                        {item.name}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${item.color}`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <span className="text-[10px] text-slate-400">{item.updated}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CRITICAL ALERTS CARD */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" /> Critical Alerts
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-semibold">
                {criticalAlerts.length} Active
              </span>
            </div>

            <div className="space-y-3">
              {criticalAlerts.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => navigate(alert.route)}
                  className="group p-3 rounded-xl bg-rose-50/50 border border-rose-100 hover:border-rose-300 hover:bg-rose-50 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                      {alert.priority} Priority
                    </span>
                    <span className="text-[10px] text-slate-500">{alert.time}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-800 group-hover:text-rose-900 mb-2">
                    {alert.title}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-rose-100">
                    <span>Dept: <strong className="text-slate-700">{alert.department}</strong></span>
                    <span className="text-indigo-600 font-medium group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Resolve <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* RECENT AI DECISIONS TABLE */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-600" /> Recent AI Decisions
            </h3>
            <p className="text-xs text-slate-500">Autonomous execution log by enterprise cognitive agents</p>
          </div>
          <button 
            onClick={() => navigate('/workflows')}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg transition-all"
          >
            View Engine <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Decision</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {recentAiDecisions.map((item, idx) => (
                <tr
                  key={idx}
                  onClick={() => navigate('/workflows')}
                  className="group hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-4 font-medium text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {item.decision}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <span className="px-2 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs">
                      {item.department}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-emerald-600">{item.confidence}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${item.status === 'Executed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                      {item.status === 'Executed' ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-xs text-slate-400">
                    {item.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECENT ACTIVITIES TIMELINE */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" /> Recent Activities Timeline
            </h3>
            <p className="text-xs text-slate-500">Real-time enterprise event stream</p>
          </div>
        </div>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {recentActivities.map((act, idx) => (
            <div
              key={idx}
              onClick={() => navigate(act.route)}
              className="group relative flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200/80 hover:border-indigo-500 hover:bg-slate-50 transition-all duration-200 cursor-pointer shadow-sm"
            >
              {/* Timeline Dot */}
              <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-indigo-600 group-hover:scale-125 transition-transform"></div>
              
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                  {act.title}
                </h4>
                <p className="text-xs text-slate-500">{act.desc}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">{act.time}</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}