import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useSocket } from '../../hooks/useSocket';
import {
  ChefHat,
  Flame,
  CheckCircle2,
  Utensils,
  Clock,
  RefreshCw,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Printer,
  Volume2,
  AlertTriangle,
} from 'lucide-react';

interface KanbanOrderItem {
  id: string;
  name: string;
  imageUrl: string;
  isVeg: boolean;
  quantity: number;
  unitPrice: number;
  addons: Array<{ name: string; price: number }>;
  subtotal: number;
  addedByName?: string;
}

interface KanbanOrder {
  id: string;
  orderNumber: string;
  tableNumber: string;
  status: 'PLACED' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED';
  totalAmount: number;
  customerNotes?: string;
  customerName?: string;
  customerMobile?: string;
  chefAssigned?: string;
  createdAt: string;
  updatedAt: string;
  items: KanbanOrderItem[];
}

export const KanbanOrderBoard: React.FC = () => {
  const { token, user } = useAdminAuth();
  const { socket, joinRoom } = useSocket();
  const [orders, setOrders] = useState<KanbanOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [soundEnabled, setSoundEnabled] = useState(true);

  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(() => {});
    } catch (e) {}
  };

  const fetchOrders = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setLastRefreshed(new Date());
        setError(null);
      }
    } catch (err: any) {
      console.error('Fetch orders error:', err);
      setError('Failed to fetch orders from server');
    } finally {
      setLoading(false);
    }
  };

  // Force re-render every 30s to update elapsed time badges
  const [, setTick] = useState(0);
  useEffect(() => {
    const tickInterval = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(tickInterval);
  }, []);

  useEffect(() => {
    fetchOrders();
    joinRoom('kitchen');

    if (socket) {
      socket.on('new_order', () => {
        playChime();
        fetchOrders();
      });

      socket.on('order_status_updated', () => {
        fetchOrders();
      });

      socket.on('order_paid', () => {
        fetchOrders();
      });
    }

    return () => {
      socket?.off('new_order');
      socket?.off('order_status_updated');
      socket?.off('order_paid');
    };
  }, [socket, token]);

  const updateOrderStatus = async (orderId: string, nextStatus: string) => {
    setUpdatingId(orderId);
    try {
      const chefName = user?.role === 'CHEF' ? user.name : 'Chef Suresh';
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus, chefAssigned: chefName }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus as any, chefAssigned: chefName } : o))
        );
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update order status');
      }
    } catch (err) {
      console.error('Update status error:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePrintKOT = (order: KanbanOrder) => {
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>KOT - ${order.orderNumber}</title>
          <style>
            body { font-family: monospace; padding: 20px; font-size: 14px; }
            .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; }
            .item { display: flex; justify-content: space-between; margin: 8px 0; }
            .footer { border-top: 2px dashed #000; margin-top: 15px; padding-top: 10px; text-align: center; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Tablecast</h2>
            <h3>KITCHEN ORDER TICKET (KOT)</h3>
            <p>Order #: <strong>${order.orderNumber}</strong> | ${order.tableNumber}</p>
            <p>Time: ${new Date(order.createdAt).toLocaleTimeString()}</p>
            ${order.customerName ? `<p>Guest: ${order.customerName}</p>` : ''}
          </div>
          <div style="margin-top:15px;">
            ${order.items.map(it => `
              <div class="item">
                <span>${it.quantity}x ${it.name} ${it.addedByName ? `(${it.addedByName})` : ''}</span>
              </div>
            `).join('')}
          </div>
          ${order.customerNotes ? `<p style="border: 1px solid #000; padding: 6px; margin-top: 10px;"><strong>Notes:</strong> ${order.customerNotes}</p>` : ''}
          <div class="footer">
            <p>*** PASS CHECK COMPLETE ***</p>
          </div>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const getElapsedTimeMinutes = (createdAtStr: string) => {
    const elapsed = (new Date().getTime() - new Date(createdAtStr).getTime()) / (1000 * 60);
    return Math.floor(elapsed);
  };

  const placedOrders = orders.filter((o) => o.status === 'PLACED' || o.status === 'ACCEPTED');
  const preparingOrders = orders.filter((o) => o.status === 'PREPARING');
  const readyOrders = orders.filter((o) => o.status === 'READY');
  const servedOrders = orders.filter((o) => o.status === 'SERVED');

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white flex items-center space-x-2">
            <span>Kitchen Order Board</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-mono">
              {placedOrders.length + preparingOrders.length + readyOrders.length} active
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Powered by WebSockets. Instant real-time pass updates.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
              soundEnabled ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-charcoal-800 text-slate-400 border-white/10'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{soundEnabled ? 'Audio Alerts On' : 'Muted'}</span>
          </button>

          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>WebSocket Live • {lastRefreshed.toLocaleTimeString()}</span>
          </div>

          <button
            onClick={fetchOrders}
            className="p-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-slate-300 border border-white/10 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-400' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4-Column Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 items-start">
        {/* Column 1: New / Placed */}
        <div className="glass-panel p-4 rounded-3xl border border-yellow-500/20 flex flex-col space-y-3 min-h-[500px]">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse"></span>
              <h3 className="font-bold text-xs uppercase tracking-wider text-yellow-300">
                New Tickets
              </h3>
            </div>
            <span className="w-5 h-5 rounded-full bg-yellow-500/20 text-yellow-300 text-[10px] font-black flex items-center justify-center">
              {placedOrders.length}
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[70vh]">
            {placedOrders.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No new orders waiting
              </div>
            ) : (
              placedOrders.map((order) => {
                const elapsedMins = getElapsedTimeMinutes(order.createdAt);
                const isEscalated = elapsedMins >= 12;

                return (
                  <div
                    key={order.id}
                    className={`glass-card p-4 rounded-2xl border transition-all ${
                      isEscalated ? 'border-rose-500 bg-rose-500/10 animate-pulse' : 'border-yellow-500/30 hover:border-yellow-400/50'
                    } shadow-sm space-y-3`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-mono font-bold text-white">
                          {order.orderNumber}
                        </span>
                        <span className="block text-xs font-black text-orange-400">
                          {order.tableNumber} {order.customerName ? `• ${order.customerName}` : ''}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 flex items-center justify-end">
                          <Clock className="w-3 h-3 mr-1" /> {formatTime(order.createdAt)}
                        </span>
                        {isEscalated && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500 text-white font-bold uppercase flex items-center mt-1">
                            <AlertTriangle className="w-3 h-3 mr-1" /> {elapsedMins}m Overdue
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Items Summary */}
                    <div className="space-y-1.5 py-2 border-y border-white/5 text-xs">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-slate-200">
                          <span>
                            <strong className="text-orange-400">{item.quantity}×</strong> {item.name}{' '}
                            {item.addedByName && <em className="text-slate-400 text-[10px]">({item.addedByName})</em>}
                          </span>
                          <span className="text-slate-400 text-[11px]">₹{item.subtotal}</span>
                        </div>
                      ))}
                    </div>

                    {order.customerNotes && (
                      <div className="p-2 rounded-xl bg-charcoal-900 border border-white/5 text-[11px] text-amber-300 flex items-start space-x-1.5">
                        <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                        <span className="line-clamp-2">"{order.customerNotes}"</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => handlePrintKOT(order)}
                        className="p-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-slate-300 border border-white/10"
                        title="Auto-Print KOT"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                        disabled={updatingId === order.id}
                        className="px-3 py-1.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-charcoal-950 font-black text-xs flex items-center space-x-1 transition-all active:scale-95 disabled:opacity-50"
                      >
                        <ChefHat className="w-3.5 h-3.5" />
                        <span>Accept & Prep</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Column 2: Preparing */}
        <div className="glass-panel p-4 rounded-3xl border border-orange-500/20 flex flex-col space-y-3 min-h-[500px]">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></span>
              <h3 className="font-bold text-xs uppercase tracking-wider text-orange-400">
                In Kitchen / Cooking
              </h3>
            </div>
            <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-black flex items-center justify-center">
              {preparingOrders.length}
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[70vh]">
            {preparingOrders.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No orders currently cooking
              </div>
            ) : (
              preparingOrders.map((order) => {
                const elapsedMins = getElapsedTimeMinutes(order.createdAt);
                const isEscalated = elapsedMins >= 12;

                return (
                  <div
                    key={order.id}
                    className={`glass-card p-4 rounded-2xl border ${
                      isEscalated ? 'border-rose-500 bg-rose-500/10' : 'border-orange-500/40 shadow-glow'
                    } space-y-3`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-mono font-bold text-white">
                          {order.orderNumber}
                        </span>
                        <span className="block text-xs font-black text-orange-300">
                          {order.tableNumber}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-orange-400 font-semibold flex items-center justify-end">
                          <Flame className="w-3 h-3 mr-1" /> Baking
                        </span>
                        {isEscalated && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500 text-white font-bold uppercase block mt-1">
                            {elapsedMins}m Cooking
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5 py-2 border-y border-white/5 text-xs">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-slate-200">
                          <span>
                            <strong className="text-orange-400">{item.quantity}×</strong> {item.name}
                          </span>
                          <span className="text-slate-400 text-[11px]">₹{item.subtotal}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => handlePrintKOT(order)}
                        className="p-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-slate-300 border border-white/10"
                        title="Re-Print KOT"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => updateOrderStatus(order.id, 'READY')}
                        disabled={updatingId === order.id}
                        className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-charcoal-950 font-black text-xs flex items-center space-x-1 shadow-glow transition-all active:scale-95 disabled:opacity-50"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Mark Ready</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Column 3: Ready to Serve */}
        <div className="glass-panel p-4 rounded-3xl border border-emerald-500/20 flex flex-col space-y-3 min-h-[500px]">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-400">
                Pass Ready
              </h3>
            </div>
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black flex items-center justify-center">
              {readyOrders.length}
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[70vh]">
            {readyOrders.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No plated dishes waiting
              </div>
            ) : (
              readyOrders.map((order) => (
                <div
                  key={order.id}
                  className="glass-card p-4 rounded-2xl border border-emerald-500/40 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-white">
                        {order.orderNumber}
                      </span>
                      <span className="block text-xs font-black text-emerald-400">
                        {order.tableNumber}
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold uppercase">
                      Pass Ready
                    </span>
                  </div>

                  <div className="space-y-1.5 py-2 border-y border-white/5 text-xs">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-slate-200">
                        <span>
                          <strong className="text-emerald-400">{item.quantity}×</strong> {item.name}
                        </span>
                        <span className="text-slate-400 text-[11px]">₹{item.subtotal}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-bold text-white">₹{order.totalAmount}</span>
                    <button
                      onClick={() => updateOrderStatus(order.id, 'SERVED')}
                      disabled={updatingId === order.id}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-charcoal-950 font-black text-xs flex items-center space-x-1 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Utensils className="w-3.5 h-3.5" />
                      <span>Mark Served</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 4: Served / Completed */}
        <div className="glass-panel p-4 rounded-3xl border border-white/5 flex flex-col space-y-3 min-h-[500px]">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                Delivered / Served
              </h3>
            </div>
            <span className="w-5 h-5 rounded-full bg-charcoal-700 text-slate-300 text-[10px] font-black flex items-center justify-center">
              {servedOrders.length}
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[70vh]">
            {servedOrders.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No completed orders yet
              </div>
            ) : (
              servedOrders.map((order) => (
                <div
                  key={order.id}
                  className="glass-card p-3.5 rounded-2xl border border-white/5 opacity-80 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-slate-300">
                        {order.orderNumber}
                      </span>
                      <span className="block text-[11px] text-slate-400">
                        {order.tableNumber}
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-charcoal-800 text-slate-400 font-semibold flex items-center">
                      <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" /> Served
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1 border-t border-white/5">
                    <span>{order.items.length} items</span>
                    <span className="font-bold text-slate-200">₹{order.totalAmount}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
