import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminOrder } from '../../types';
import { useAdminAuth } from '../../context/AdminAuthContext';
import {
  Flame,
  Clock,
  CheckCircle2,
  Bell,
  Utensils,
  AlertCircle,
  RefreshCw,
  Search,
  Check,
  MessageSquare,
  ChefHat,
  ShieldCheck,
} from 'lucide-react';

interface KitchenKanbanBoardProps {
  onOrdersUpdated?: () => void;
}

export const KitchenKanbanBoard: React.FC<KitchenKanbanBoardProps> = ({ onOrdersUpdated }) => {
  const { token } = useAdminAuth();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filterSearch, setFilterSearch] = useState('');
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    if (!token) return;

    try {
      const res = await fetch('/api/admin/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setLastSync(new Date());
        setError(null);
        if (onOrdersUpdated) onOrdersUpdated();
      } else {
        throw new Error('Failed to sync orders.');
      }
    } catch (err: any) {
      console.error('Error fetching admin orders:', err);
      setError('Connection interrupted. Retrying...');
    } finally {
      setLoading(false);
    }
  }, [token, onOrdersUpdated]);

  // Live auto-polling every 3 seconds as specified
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Update Status handler
  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus as any } : o))
        );
        if (onOrdersUpdated) onOrdersUpdated();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update order status');
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter logic
  const filteredOrders = orders.filter((order) => {
    if (!filterSearch.trim()) return true;
    const query = filterSearch.toLowerCase();
    const matchesNumber = order.orderNumber.toLowerCase().includes(query);
    const matchesTable = (order.tableNumber || '').toLowerCase().includes(query);
    const matchesItems = order.items.some((i) => i.name.toLowerCase().includes(query));
    return matchesNumber || matchesTable || matchesItems;
  });

  const placedOrders = filteredOrders.filter((o) => o.status === 'PLACED');
  const preparingOrders = filteredOrders.filter((o) => o.status === 'PREPARING');
  const readyOrders = filteredOrders.filter((o) => o.status === 'READY');
  const servedOrders = filteredOrders.filter((o) => o.status === 'SERVED');

  const columns = [
    {
      id: 'PLACED',
      title: 'New Orders',
      icon: Flame,
      count: placedOrders.length,
      orders: placedOrders,
      badgeBg: 'bg-[#FBBF54]/20 text-[#FBBF54] border-[#FBBF54]/40',
      headerBorder: 'border-[#FBBF54]/40',
      actionLabel: 'Accept & Prep',
      actionIcon: ChefHat,
      actionNextStatus: 'PREPARING',
      actionClass: 'btn-ember-primary',
      progressPercent: '33%',
    },
    {
      id: 'PREPARING',
      title: 'In Kitchen / Oven',
      icon: Clock,
      count: preparingOrders.length,
      orders: preparingOrders,
      badgeBg: 'bg-ember-500/20 text-ember-500 border-ember-500/40',
      headerBorder: 'border-ember-500/40',
      actionLabel: 'Mark Ready',
      actionIcon: Check,
      actionNextStatus: 'READY',
      actionClass: 'bg-gradient-to-r from-amber-500 to-emerald-500 text-bg-primary font-bold shadow-glow hover:brightness-110',
      progressPercent: '66%',
    },
    {
      id: 'READY',
      title: 'Ready to Serve',
      icon: Bell,
      count: readyOrders.length,
      orders: readyOrders,
      badgeBg: 'bg-[#4ADE80]/20 text-[#4ADE80] border-[#4ADE80]/40',
      headerBorder: 'border-[#4ADE80]/40',
      actionLabel: 'Mark Served',
      actionIcon: CheckCircle2,
      actionNextStatus: 'SERVED',
      actionClass: 'bg-[#4ADE80] hover:bg-[#34D399] text-bg-primary font-bold shadow-glow',
      progressPercent: '100%',
    },
    {
      id: 'SERVED',
      title: 'Delivered / Served',
      icon: Utensils,
      count: servedOrders.length,
      orders: servedOrders.slice(0, 10),
      badgeBg: 'bg-[#5EA8E0]/20 text-[#5EA8E0] border-[#5EA8E0]/40',
      headerBorder: 'border-[#5EA8E0]/30',
      actionLabel: null,
      actionIcon: null,
      actionNextStatus: null,
      actionClass: '',
      progressPercent: '100%',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-text-primary flex items-center space-x-2">
            <span>Live Kitchen Order Board</span>
            <span className="w-2.5 h-2.5 rounded-full bg-status-success animate-ping" />
          </h2>
          <p className="text-xs text-text-secondary mt-0.5 flex items-center space-x-2">
            <span>Live Polling (3s)</span>
            <span>•</span>
            <span className="tabular-nums">Synced at {lastSync.toLocaleTimeString()}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              placeholder="Search table, item, or order #..."
              className="w-full pl-9 pr-3 py-1.5 bg-bg-surface border border-border-subtle rounded-xl text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-ember-500"
            />
          </div>

          <button
            onClick={() => fetchOrders()}
            className="p-2 rounded-xl bg-bg-surface border border-border-subtle text-text-secondary hover:text-text-primary hover:border-ember-500/40 transition-all text-xs flex items-center space-x-1.5"
            title="Manual Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-ember-500' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4-Column Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 items-start">
        {columns.map((col) => {
          const ColIcon = col.icon;
          return (
            <div
              key={col.id}
              className="glass-panel rounded-2xl border border-border-subtle bg-bg-surface/60 flex flex-col min-h-[500px]"
            >
              {/* Column Header */}
              <div
                className={`p-4 border-b ${col.headerBorder} flex items-center justify-between bg-bg-surface rounded-t-2xl`}
              >
                <div className="flex items-center space-x-2">
                  <ColIcon className="w-4 h-4 text-text-secondary" />
                  <span className="text-sm font-semibold text-text-primary">{col.title}</span>
                </div>
                <motion.span
                  key={col.count}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border tabular-nums ${col.badgeBg}`}
                >
                  {col.count}
                </motion.span>
              </div>

              {/* Order Cards Container */}
              <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
                {col.orders.length === 0 ? (
                  <div className="text-center py-12 px-4 border border-dashed border-border-subtle/40 rounded-xl">
                    <Utensils className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-50" />
                    <p className="text-xs text-text-muted">No orders in this stage</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {col.orders.map((order) => (
                      <motion.div
                        key={order.id}
                        layout
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        whileHover={{ rotate: 1, scale: 1.01 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                        className="glass-card p-4 rounded-xl border border-border-subtle hover:border-ember-500/40 shadow-3d space-y-3 relative overflow-hidden"
                      >
                        {/* Ticket Progress Fill Sweep Bar */}
                        <div
                          className="absolute top-0 left-0 h-1 bg-ember-gradient transition-all duration-500"
                          style={{ width: col.progressPercent }}
                        />

                        {/* Top Meta Info */}
                        <div className="flex items-center justify-between pt-1">
                          <div>
                            <span className="text-xs font-mono font-bold text-text-primary">
                              #{order.orderNumber}
                            </span>
                            <span className="block text-xs font-black text-ember-500">
                              {order.tableNumber || 'Table 05'}
                            </span>
                          </div>
                          <span className="text-[10px] text-text-muted flex items-center tabular-nums">
                            <Clock className="w-3 h-3 mr-1 text-ember-500" />
                            {new Date(order.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        {/* Pass Ready Tag if ready/preparing */}
                        {col.id === 'READY' && (
                          <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-status-success/15 border border-status-success/30 text-status-success text-[10px] font-extrabold tracking-wide">
                            <ShieldCheck className="w-3 h-3" />
                            <span>PASS READY</span>
                          </div>
                        )}

                        {/* Items List */}
                        <div className="space-y-1.5 py-2 border-y border-border-subtle text-xs">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between items-start text-text-primary">
                              <span>
                                <strong className="text-ember-500 font-extrabold">{item.quantity}×</strong>{' '}
                                {item.name}
                              </span>
                              <span className="text-text-muted text-[11px] tabular-nums font-semibold">
                                ₹{item.subtotal}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Guest Note Callout */}
                        {order.customerNotes && (
                          <div className="p-2 rounded-xl bg-bg-primary border border-ember-500/20 text-[11px] text-gold-highlight flex items-start space-x-1.5">
                            <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5 text-ember-500" />
                            <span className="line-clamp-2 italic">"{order.customerNotes}"</span>
                          </div>
                        )}

                        {/* Action Bar */}
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs font-serif font-bold text-text-primary tabular-nums">
                            ₹{order.totalAmount}
                          </span>

                          {col.actionNextStatus && col.actionLabel && (
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleUpdateStatus(order.id, col.actionNextStatus!)}
                              disabled={updatingId === order.id}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${col.actionClass}`}
                            >
                              {col.actionIcon && <col.actionIcon className="w-3.5 h-3.5" />}
                              <span>{updatingId === order.id ? 'Updating...' : col.actionLabel}</span>
                            </motion.button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
