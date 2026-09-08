import React, { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { AdminOverviewStats as StatsType } from '../../types';
import { AdminOverviewStats } from './AdminOverviewStats';
import { KitchenKanbanBoard } from './KitchenKanbanBoard';
import { TableQRManagement } from './TableQRManagement';
import { AnalyticsAndAiInsights } from './AnalyticsAndAiInsights';
import { ClocheLogo } from '../ClocheLogo';
import {
  LayoutDashboard,
  QrCode,
  BarChart3,
  LogOut,
  ExternalLink,
  Menu as MenuIcon,
  X,
  ChefHat,
} from 'lucide-react';

interface AdminDashboardLayoutProps {
  onSwitchToCustomer?: () => void;
}

export const AdminDashboardLayout: React.FC<AdminDashboardLayoutProps> = ({
  onSwitchToCustomer,
}) => {
  const { user, token, logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<'KANBAN' | 'TABLES' | 'ANALYTICS'>('KANBAN');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<StatsType | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch overview stats
  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/overview', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoadingStats(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const navItems = [
    { id: 'KANBAN', label: 'Kitchen Kanban', icon: LayoutDashboard },
    { id: 'TABLES', label: 'Table Stand QRs', icon: QrCode },
    { id: 'ANALYTICS', label: 'AI Insights & Analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-charcoal-950 text-slate-100 flex selection:bg-orange-500 selection:text-white">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-charcoal-900 border-r border-white/5 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shadow-glow text-white">
                <ClocheLogo className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-serif font-bold text-base tracking-wide text-white leading-tight">
                  Tablecast
                </h1>
                <p className="text-[10px] uppercase tracking-widest text-orange-400 font-bold">
                  DINE SMART
                </p>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/10 text-orange-300 border border-orange-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-charcoal-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-orange-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Logout Bottom Section */}
        <div className="p-4 border-t border-white/5 space-y-3">
          <div className="p-3 rounded-xl bg-charcoal-950/60 border border-white/5 flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-xs">
              <ChefHat className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'Chef Vikram'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@tablecast.com'}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/20 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-charcoal-900/60 border-b border-white/5 px-4 sm:px-6 flex items-center justify-between backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-charcoal-800 text-slate-300 hover:text-white"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-slate-300">Live Kitchen & Operations Board</span>
            </div>
          </div>

          {/* Switch to Customer Menu preview button */}
          <div className="flex items-center space-x-3">
            <a
              href="/order?table=tbl_05_tok_38a9d1"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500/20 to-amber-500/10 hover:bg-orange-500/30 text-orange-300 border border-orange-500/30 text-xs font-semibold transition-all"
            >
              <span>Demo Customer (Table 05)</span>
              <ExternalLink className="w-3 h-3 text-orange-400" />
            </a>

            {onSwitchToCustomer && (
              <button
                onClick={onSwitchToCustomer}
                className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-slate-200 hover:text-white border border-white/10 text-xs font-semibold transition-all"
              >
                <span>Switch to Customer App</span>
              </button>
            )}
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Top Operational Metrics */}
          <AdminOverviewStats stats={stats} loading={loadingStats} />

          {/* Active View Container */}
          {activeTab === 'KANBAN' && (
            <KitchenKanbanBoard onOrdersUpdated={fetchStats} />
          )}

          {activeTab === 'TABLES' && (
            <TableQRManagement />
          )}

          {activeTab === 'ANALYTICS' && (
            <AnalyticsAndAiInsights />
          )}
        </main>
      </div>
    </div>
  );
};
