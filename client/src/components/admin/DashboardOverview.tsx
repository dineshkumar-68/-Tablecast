import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import {
  DollarSign,
  ShoppingBag,
  ChefHat,
  Users,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';

interface StatsResponse {
  totalOrders: number;
  activeOrders: number;
  placedCount: number;
  preparingCount: number;
  readyCount: number;
  servedCount: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalTables: number;
  occupiedTables: number;
  availableTables: number;
}

interface DashboardOverviewProps {
  onNavigateToOrders: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigateToOrders }) => {
  const { token } = useAdminAuth();
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchStats = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.error('Stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
            Dashboard Overview
          </h2>
          <p className="text-xs text-slate-400">
            Real-time restaurant performance metrics and active table status.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live • Refreshed {lastRefreshed.toLocaleTimeString()}</span>
          </div>
          <button
            onClick={fetchStats}
            className="p-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-slate-300 border border-white/10 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Total Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">
              ₹{stats ? stats.totalRevenue.toLocaleString() : '—'}
            </span>
          </div>
          <span className="text-[11px] text-emerald-400/90 font-medium mt-1 block">
            Avg Order Value: ₹{stats?.averageOrderValue || 0}
          </span>
        </div>

        {/* Total Orders */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">{stats ? stats.totalOrders : '—'}</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {stats?.servedCount || 0} served • {stats?.activeOrders || 0} active
          </span>
        </div>

        {/* Kitchen In-Prep */}
        <div className="glass-panel p-5 rounded-2xl border border-orange-500/30 shadow-glow relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-orange-300">Kitchen Queue</span>
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center">
              <ChefHat className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400">
              {stats ? stats.activeOrders : '—'}
            </span>
            <span className="text-xs text-orange-400 font-semibold">orders</span>
          </div>
          <span className="text-[11px] text-orange-300/80 mt-1 block">
            {stats?.placedCount || 0} New • {stats?.preparingCount || 0} In-Oven • {stats?.readyCount || 0} Ready
          </span>
        </div>

        {/* Table Occupancy */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Table Occupancy</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">
              {stats ? `${stats.occupiedTables}/${stats.totalTables}` : '—'}
            </span>
            <span className="text-xs text-slate-400">tables</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {stats?.availableTables || 0} tables currently available
          </span>
        </div>
      </div>

      {/* Quick Action Banner to Kanban */}
      <div className="glass-panel p-6 rounded-3xl border border-orange-500/30 bg-gradient-to-r from-charcoal-900 via-orange-950/30 to-charcoal-900 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-charcoal-950 shadow-glow shrink-0">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Live Kitchen Order Kanban</h3>
            <p className="text-xs text-slate-300">
              Manage incoming customer table orders, move tickets between prep stages, and alert waiters.
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToOrders}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-charcoal-950 font-black text-xs sm:text-sm flex items-center space-x-1.5 shadow-glow hover:shadow-glow-gold active:scale-95 transition-all"
        >
          <span>Open Kanban Board</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
