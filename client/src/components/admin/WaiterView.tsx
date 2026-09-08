import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useSocket } from '../../hooks/useSocket';
import { CheckCircle2, PhoneCall, RefreshCw, Utensils } from 'lucide-react';


interface WaiterAlert {
  id: string;
  tableNumber: string;
  type: string;
  guestName?: string;
  createdAt: string;
}

interface ReadyOrder {
  id: string;
  orderNumber: string;
  tableNumber: string;
  totalAmount: number;
  items: Array<{ name: string; quantity: number }>;
}

export const WaiterView: React.FC = () => {
  const { token } = useAdminAuth();
  const { socket, joinRoom } = useSocket();
  const [alerts, setAlerts] = useState<WaiterAlert[]>([]);
  const [readyOrders, setReadyOrders] = useState<ReadyOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWaiterViewData = async () => {
    if (!token) return;
    try {
      // 1. Fetch ready to serve orders
      const res = await fetch('/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const orders = data.orders || [];
        const ready = orders
          .filter((o: any) => o.status === 'READY')
          .map((o: any) => ({
            id: o.id,
            orderNumber: o.orderNumber,
            tableNumber: o.tableNumber,
            totalAmount: o.totalAmount,
            items: o.items || [],
          }));
        setReadyOrders(ready);
      }

      // 2. Fetch active pending waiter calls from database
      const callsRes = await fetch('/api/admin/table-calls', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (callsRes.ok) {
        const callsData = await callsRes.json();
        setAlerts(callsData.calls || []);
      }
    } catch (e) {
      console.error('Error fetching waiter view:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaiterViewData();
    joinRoom('waiter');

    if (socket) {
      socket.on('waiter_alert', (newAlert: WaiterAlert) => {
        setAlerts((prev) => {
          if (prev.some((a) => a.id === newAlert.id)) return prev;
          return [newAlert, ...prev];
        });
        try {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.play().catch(() => {});
        } catch (_) {}
      });

      socket.on('waiter_call', (newAlert: WaiterAlert) => {
        setAlerts((prev) => {
          if (prev.some((a) => a.id === newAlert.id)) return prev;
          return [newAlert, ...prev];
        });
      });

      socket.on('order_status_updated', () => {
        fetchWaiterViewData();
      });
    }

    return () => {
      socket?.off('waiter_alert');
      socket?.off('waiter_call');
      socket?.off('order_status_updated');
    };
  }, [socket, token]);

  const dismissAlert = async (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    try {
      await fetch(`/api/admin/table-calls/${id}/resolve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) {
      console.error('Error resolving table call:', e);
    }
  };

  const markOrderServed = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'SERVED' }),
      });

      if (res.ok) {
        setReadyOrders((prev) => prev.filter((o) => o.id !== orderId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white flex items-center space-x-2">
            <span>Waiter Service Console</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              {alerts.length + readyOrders.length} alerts
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time table calls, check requests, and ready-to-serve orders.
          </p>
        </div>

        <button
          onClick={fetchWaiterViewData}
          className="p-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-slate-300 border border-white/10"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Table Calls Column */}
        <div className="glass-panel p-5 rounded-3xl border border-rose-500/20 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="font-bold text-sm uppercase tracking-wider text-rose-400 flex items-center space-x-2">
              <PhoneCall className="w-4 h-4 animate-bounce" />
              <span>Table Assistance Calls</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold">
              {alerts.length}
            </span>
          </div>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No active table assistance calls
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between animate-pulse"
                >
                  <div className="space-y-1">
                    <span className="text-sm font-black text-white block">
                      {alert.tableNumber}
                    </span>
                    <span className="text-xs text-rose-300 font-semibold">
                      {alert.guestName ? `${alert.guestName} called for ${alert.type}` : 'Calling Waiter'}
                    </span>
                  </div>

                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs flex items-center space-x-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Acknowledge</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ready to Serve Pickup Column */}
        <div className="glass-panel p-5 rounded-3xl border border-emerald-500/20 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="font-bold text-sm uppercase tracking-wider text-emerald-400 flex items-center space-x-2">
              <Utensils className="w-4 h-4" />
              <span>Ready for Pickup & Serve</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
              {readyOrders.length}
            </span>
          </div>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {readyOrders.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No dishes waiting at the pass
              </div>
            ) : (
              readyOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-mono text-slate-400">{order.orderNumber}</span>
                      <h4 className="text-sm font-black text-emerald-300">{order.tableNumber}</h4>
                    </div>
                    <span className="text-xs font-bold text-white">₹{order.totalAmount}</span>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1 py-2 border-t border-white/5">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{it.quantity}× {it.name}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => markOrderServed(order.id)}
                    className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-charcoal-950 font-black text-xs flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Picked Up & Served</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
