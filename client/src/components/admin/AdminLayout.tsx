import React, { useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { DashboardOverview } from './DashboardOverview';
import { KanbanOrderBoard } from './KanbanOrderBoard';
import { TableManagement } from './TableManagement';
import { MenuManagement } from './MenuManagement';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { WaiterView } from './WaiterView';
import {
  Flame,
  LayoutDashboard,
  ChefHat,
  LogOut,
  Utensils,
  QrCode,
  BarChart3,
  ExternalLink,
  ShieldCheck,
  ConciergeBell,
} from 'lucide-react';

interface AdminLayoutProps {
  onGoToCustomerSite: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onGoToCustomerSite }) => {
  const { user, logout } = useAdminAuth();
  const role = user?.role?.toUpperCase() || 'MANAGER';

  const defaultTab = role === 'CHEF' ? 'ORDERS' : role === 'WAITER' ? 'WAITER_VIEW' : 'DASHBOARD';
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'ORDERS' | 'WAITER_VIEW' | 'MENU' | 'TABLES' | 'ANALYTICS'>(defaultTab);

  const allNavItems = [
    { key: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER'] },
    { key: 'ORDERS', label: 'Kitchen Orders', icon: ChefHat, badge: 'Live', roles: ['ADMIN', 'MANAGER', 'CHEF'] },
    { key: 'WAITER_VIEW', label: 'Waiter View', icon: ConciergeBell, badge: 'Alerts', roles: ['ADMIN', 'MANAGER', 'WAITER'] },
    { key: 'MENU', label: 'Menu Management', icon: Utensils, roles: ['ADMIN', 'MANAGER', 'CHEF'] },
    { key: 'TABLES', label: 'Tables & QR', icon: QrCode, roles: ['ADMIN', 'MANAGER', 'WAITER'] },
    { key: 'ANALYTICS', label: 'Analytics & AI', icon: BarChart3, roles: ['ADMIN', 'MANAGER'] },
  ];

  const allowedNavItems = allNavItems.filter((item) => role === 'ADMIN' || item.roles.includes(role));

  return (
    <div className="min-h-screen bg-charcoal-950 text-slate-100 flex flex-col md:flex-row selection:bg-orange-500 selection:text-white">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-charcoal-900 border-r border-white/5 flex flex-col justify-between p-4 shrink-0">
        <div>
          {/* Brand Header */}
          <div className="flex items-center space-x-3 px-3 py-4 mb-4 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-600 flex items-center justify-center shadow-glow shrink-0">
              <Flame className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-sm tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-amber-200 to-yellow-400">
                EMBER & PLATE
              </h1>
              <span className="text-[10px] text-orange-400 font-semibold tracking-wider uppercase block">
                {role} PORTAL
              </span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5">
            {allowedNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-charcoal-950 shadow-glow font-black'
                      : 'text-slate-400 hover:text-white hover:bg-charcoal-800'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                        isActive
                          ? 'bg-charcoal-950/40 text-charcoal-950'
                          : 'bg-orange-500/20 text-orange-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-white/5 space-y-3">
          <button
            onClick={onGoToCustomerSite}
            className="w-full py-2.5 px-3 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 border border-white/5 text-xs text-orange-300 font-medium flex items-center justify-between transition-colors"
          >
            <span>Customer Ordering</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center justify-between p-2 rounded-xl bg-charcoal-950 border border-white/5">
            <div className="flex items-center space-x-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{user?.name || 'Staff User'}</p>
                <p className="text-[10px] text-orange-400 font-semibold truncate">{role}</p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-charcoal-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {activeTab === 'DASHBOARD' && (
          <DashboardOverview onNavigateToOrders={() => setActiveTab('ORDERS')} />
        )}
        {activeTab === 'ORDERS' && <KanbanOrderBoard />}
        {activeTab === 'WAITER_VIEW' && <WaiterView />}
        {activeTab === 'MENU' && <MenuManagement />}
        {activeTab === 'TABLES' && <TableManagement />}
        {activeTab === 'ANALYTICS' && <AnalyticsDashboard />}
      </main>
    </div>
  );
};

