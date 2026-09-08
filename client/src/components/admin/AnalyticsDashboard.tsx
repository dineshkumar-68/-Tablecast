import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Sparkles,
  RefreshCw,
  Lightbulb,
  Download,
  AlertTriangle,
  Users,
  FileText,
} from 'lucide-react';


interface TopItem {
  name: string;
  count: number;
  revenue: number;
  isVeg: boolean;
}

interface SlowMovingItem {
  id: string;
  name: string;
  count: number;
  price: number;
  costPrice: number;
  margin: number;
}

interface RepeatCustomer {
  mobile: string;
  name: string;
  orderCount: number;
  totalSpent: number;
}

interface CategoryShare {
  name: string;
  revenue: number;
  percentage: number;
}

interface HourlyItem {
  hour: string;
  orders: number;
}

interface AiInsight {
  id: string;
  title: string;
  summary: string;
  tag: string;
  confidence: string;
  type: string;
}

interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  grossMarginPercent: number;
  averageOrderValue: number;
  topItems: TopItem[];
  slowMovingItems: SlowMovingItem[];
  repeatCustomers: RepeatCustomer[];
  categoryBreakdown: CategoryShare[];
  hourlyDistribution: HourlyItem[];
  aiInsights: AiInsight[];
}

export const AnalyticsDashboard: React.FC = () => {
  const { token } = useAdminAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    if (!token) return;
    try {
      const res = await fetch('/api/admin/analytics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch analytics data');
      const json = await res.json();
      setData(json.analytics);
    } catch (err: any) {
      console.error('Analytics fetch error:', err);
      setError(err.message || 'Error loading analytics');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchAnalytics();
  }, [token]);

  const exportCSV = () => {
    if (!data) return;
    const csvRows = [
      ['Metric', 'Value'],
      ['Total Gross Revenue', `INR ${data.totalRevenue}`],
      ['Total Cost (COGS)', `INR ${data.totalCost}`],
      ['Gross Profit', `INR ${data.totalProfit}`],
      ['Gross Margin', `${data.grossMarginPercent}%`],
      ['Total Orders', data.totalOrders],
      ['Average Order Value', `INR ${data.averageOrderValue}`],
      [''],
      ['Category Breakdown', 'Revenue (INR)', 'Percentage'],
      ...data.categoryBreakdown.map((c) => [c.name, c.revenue, `${c.percentage}%`]),
      [''],
      ['Top Items', 'Units Sold', 'Revenue (INR)'],
      ...data.topItems.map((t) => [t.name, t.count, t.revenue]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tablecast_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    if (!data) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tablecast - Analytics Executive Summary</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; padding: 40px; margin: 0; }
          .header { border-bottom: 2px solid #f97316; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
          .title { font-size: 24px; font-weight: bold; color: #0f172a; margin: 0; }
          .subtitle { font-size: 14px; color: #64748b; margin-top: 4px; }
          .date { font-size: 12px; color: #94a3b8; }
          .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 30px; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
          .card-label { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; margin-bottom: 6px; }
          .card-val { font-size: 20px; font-weight: bold; color: #0f172a; }
          .section { margin-bottom: 30px; }
          .section-title { font-size: 16px; font-weight: bold; color: #0f172a; margin-bottom: 12px; border-left: 4px solid #f97316; padding-left: 8px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th { background: #f1f5f9; text-align: left; padding: 10px; font-size: 12px; color: #475569; border-bottom: 1px solid #cbd5e1; }
          td { padding: 10px; font-size: 13px; border-bottom: 1px solid #e2e8f0; }
          .footer { margin-top: 50px; font-size: 11px; text-align: center; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">Tablecast | Executive Financial Report</h1>
            <p class="subtitle">Table-Wise Restaurant Ordering Analytics</p>
          </div>
          <div class="date">Generated: ${new Date().toLocaleString()}</div>
        </div>

        <div class="grid">
          <div class="card">
            <div class="card-label">Total Revenue</div>
            <div class="card-val">₹${data.totalRevenue.toLocaleString()}</div>
          </div>
          <div class="card">
            <div class="card-label">COGS (Total Cost)</div>
            <div class="card-val">₹${data.totalCost.toLocaleString()}</div>
          </div>
          <div class="card">
            <div class="card-label">Gross Margin</div>
            <div class="card-val" style="color: #16a34a;">${data.grossMarginPercent}%</div>
          </div>
          <div class="card">
            <div class="card-label">Total Orders</div>
            <div class="card-val">${data.totalOrders}</div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">Top Performing Menu Items</h2>
          <table>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Units Sold</th>
                <th>Revenue (INR)</th>
              </tr>
            </thead>
            <tbody>
              ${data.topItems.map(i => `
                <tr>
                  <td><strong>${i.name}</strong> ${i.isVeg ? '(Veg)' : '(Non-Veg)'}</td>
                  <td>${i.count}</td>
                  <td>₹${i.revenue.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2 class="section-title">Category Breakdown</h2>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Revenue (INR)</th>
                <th>Share</th>
              </tr>
            </thead>
            <tbody>
              ${data.categoryBreakdown.map(c => `
                <tr>
                  <td>${c.name}</td>
                  <td>₹${c.revenue.toLocaleString()}</td>
                  <td>${c.percentage}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="footer">
          Confidential Business Intelligence Document — Tablecast Restaurant Operating System
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const maxHourlyOrders = data
    ? Math.max(1, ...data.hourlyDistribution.map((h) => h.orders))
    : 1;

  return (
    <div className="space-y-6">
      {/* Header with Export buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white flex items-center space-x-2">
            <span>Sales Analytics & Business Intelligence</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-400 border border-orange-500/30 flex items-center space-x-1 font-bold">
              <Sparkles className="w-3 h-3" />
              <span>Margin Engine</span>
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time margin analysis, slow-moving items, and exportable financial reports.
          </p>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={exportCSV}
            className="px-3 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-charcoal-950 font-black text-xs flex items-center space-x-1.5 shadow-glow transition-all"
          >
            <Download className="w-4 h-4" />
            <span>CSV</span>
          </button>

          <button
            onClick={exportPDF}
            className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-charcoal-950 font-black text-xs flex items-center space-x-1.5 shadow-glow transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>PDF Report</span>
          </button>

          <button
            onClick={fetchAnalytics}
            className="px-3 py-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-xs font-semibold text-slate-300 border border-white/10 flex items-center space-x-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-400' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Total Gross Sales</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold text-white">
            ₹{data ? data.totalRevenue.toLocaleString() : '—'}
          </span>
          <span className="text-[11px] text-emerald-400 font-medium block mt-1">
            Profit: ₹{data ? data.totalProfit.toLocaleString() : '0'} ({data?.grossMarginPercent}%)
          </span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Total Orders Placed</span>
            <ShoppingBag className="w-4 h-4 text-orange-400" />
          </div>
          <span className="text-2xl font-bold text-white">
            {data ? data.totalOrders : '—'}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">Across dining tables</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Average Order Value</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-bold text-white">
            ₹{data ? data.averageOrderValue : '—'}
          </span>
          <span className="text-[11px] text-amber-300 block mt-1">Per dining check</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Repeat Guests</span>
            <Users className="w-4 h-4 text-orange-400" />
          </div>
          <span className="text-2xl font-bold text-white">
            {data ? data.repeatCustomers.length : '0'} Regulars
          </span>
          <span className="text-[11px] text-orange-400 block mt-1">
            Tracked by mobile number
          </span>
        </div>
      </div>

      {/* AI Narrative Insights Cards */}
      <div className="glass-panel p-6 rounded-3xl border border-orange-500/30 bg-gradient-to-r from-charcoal-900 via-orange-950/20 to-charcoal-900 space-y-4 shadow-glow">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Margin & Operational Insights</h3>
            <p className="text-[11px] text-slate-400">
              Real-time analytics evaluating dish profitability and repeat guest patterns.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {data?.aiInsights.map((insight) => (
            <div
              key={insight.id}
              className="glass-card p-4 rounded-2xl border border-white/10 hover:border-orange-500/40 transition-all space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 font-bold uppercase tracking-wider">
                    {insight.tag}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Conf: {insight.confidence}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white">{insight.title}</h4>
                <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                  {insight.summary}
                </p>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
                <span>Domain: {insight.type}</span>
                <Sparkles className="w-3 h-3 text-orange-400" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Slow-Moving Items & Repeat Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Slow-Moving Items Panel */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Slow-Moving Menu Items</span>
            </h3>
            <span className="text-[11px] text-slate-400">Low order volume</span>
          </div>

          <div className="space-y-3">
            {data?.slowMovingItems.map((item) => (
              <div key={item.id} className="p-3 rounded-2xl bg-charcoal-900 border border-white/5 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-white">{item.name}</h4>
                  <p className="text-[10px] text-slate-400">Price: ₹{item.price} | Cost: ₹{item.costPrice} (Margin: ₹{item.margin})</p>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-400 font-mono font-bold text-[11px]">
                  {item.count} Sold
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Regular Customers Directory */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Regulars Directory (Repeat Guests)</span>
            </h3>
            <span className="text-[11px] text-slate-400">By Mobile Number</span>
          </div>

          <div className="space-y-3">
            {data?.repeatCustomers.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">No repeat customers recorded yet</div>
            ) : (
              data?.repeatCustomers.map((cust) => (
                <div key={cust.mobile} className="p-3 rounded-2xl bg-charcoal-900 border border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-white">{cust.name}</h4>
                    <p className="text-[10px] text-slate-400">{cust.mobile}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold block mb-1">
                      {cust.orderCount} Visits
                    </span>
                    <span className="font-mono text-slate-300 text-[11px]">₹{cust.totalSpent}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Visual Charts: Hourly Trends & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Orders by Hour of Day</h3>
            <span className="text-[11px] text-slate-400">24-hour service profile</span>
          </div>

          <div className="h-44 flex items-end justify-between gap-1 pt-6 px-2">
            {data?.hourlyDistribution
              .filter((_, idx) => idx >= 11 && idx <= 23)
              .map((h) => {
                const heightPercent = maxHourlyOrders > 0 ? (h.orders / maxHourlyOrders) * 100 : 0;
                return (
                  <div key={h.hour} className="flex-1 flex flex-col items-center group">
                    <div className="w-full flex items-end justify-center h-28">
                      <div
                        style={{ height: `${Math.max(6, heightPercent)}%` }}
                        className="w-full max-w-[18px] bg-gradient-to-t from-orange-600 to-amber-400 rounded-t-md transition-all group-hover:from-orange-500 group-hover:to-yellow-300 shadow-sm"
                      />
                    </div>
                    <span className="text-[9px] text-slate-500 mt-2 rotate-[-45deg] origin-top-left font-mono">
                      {h.hour.split(':')[0]}h
                    </span>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Revenue by Category</h3>
            <span className="text-[11px] text-slate-400">Share of total sales</span>
          </div>

          <div className="space-y-3 pt-2">
            {data?.categoryBreakdown.map((cat) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-300">{cat.name}</span>
                  <div className="space-x-2">
                    <span className="text-slate-400 text-[11px]">₹{cat.revenue}</span>
                    <span className="font-bold text-orange-400">{cat.percentage}%</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-charcoal-800 overflow-hidden">
                  <div
                    style={{ width: `${cat.percentage}%` }}
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

