import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { RotateCcw, Phone, Search, ShoppingBag, ArrowRight, Plus, Sparkles } from 'lucide-react';

interface PastOrderItem {
  id: string;
  quantity: number;
  menuItem: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    isVeg: boolean;
    isAvailable: boolean;
    prepTimeMinutes: number;
    description: string;
    addons: Array<{ id: string; name: string; price: number }>;
  };
}

interface PastOrder {
  id: string;
  orderNumber: string;
  totalAmount: number;
  createdAt: string;
  items: PastOrderItem[];
}

interface ReorderPanelProps {
  tableToken: string | null;
  onItemAdded?: () => void;
}

export const ReorderPanel: React.FC<ReorderPanelProps> = ({ tableToken: _tableToken, onItemAdded }) => {
  const { addToCart } = useCart();
  const [mobile, setMobile] = useState('');
  const [pastOrders, setPastOrders] = useState<PastOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

  const handleLookup = async () => {
    if (!mobile || mobile.length < 10) return;
    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(`/api/orders/reorder-lookup?mobile=${encodeURIComponent(mobile)}`);
      if (res.ok) {
        const data = await res.json();
        setPastOrders(data.pastOrders || []);
      }
    } catch (e) {
      console.error('Reorder lookup error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleReorderItem = (item: PastOrderItem) => {
    if (!item.menuItem.isAvailable) return;

    addToCart(
      {
        id: item.menuItem.id,
        name: item.menuItem.name,
        price: item.menuItem.price,
        imageUrl: item.menuItem.imageUrl,
        isVeg: item.menuItem.isVeg,
        isPopular: false,
        isAvailable: item.menuItem.isAvailable,
        prepTimeMinutes: item.menuItem.prepTimeMinutes,
        description: item.menuItem.description,
        categoryId: '',
        addons: item.menuItem.addons || [],
        isJain: false,
        isVegan: false,
      } as any,
      item.quantity,
      []
    );

    setAddedItems((prev) => new Set(prev).add(item.menuItem.id));
    onItemAdded?.();
  };

  const handleReorderAll = (order: PastOrder) => {
    order.items.forEach((item) => {
      if (item.menuItem.isAvailable) {
        handleReorderItem(item);
      }
    });
  };

  return (
    <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-white/10 space-y-4">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 flex items-center justify-center">
          <RotateCcw className="w-4 h-4 text-orange-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Reorder Your Favorites</h3>
          <p className="text-[10px] text-slate-400">Enter your mobile to view past orders</p>
        </div>
      </div>

      {/* Phone Lookup */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
            placeholder="+91 9876543210"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-charcoal-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>
        <button
          onClick={handleLookup}
          disabled={loading || mobile.length < 10}
          className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center space-x-1.5 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Search className="w-3.5 h-3.5" />
          <span>{loading ? 'Searching...' : 'Find Orders'}</span>
        </button>
      </div>

      {/* Results */}
      {searched && pastOrders.length === 0 && !loading && (
        <div className="py-6 text-center text-slate-500 text-xs">
          <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-slate-600" />
          <p>No past orders found for this number.</p>
          <p className="text-[10px] text-slate-600 mt-1">Try a different number or place your first order!</p>
        </div>
      )}

      {pastOrders.length > 0 && (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {pastOrders.map((order) => (
            <div
              key={order.id}
              className="p-3 rounded-2xl bg-charcoal-900/80 border border-white/5 hover:border-orange-500/30 transition-colors space-y-2.5"
            >
              {/* Order Header */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-orange-400">
                    {order.orderNumber}
                  </span>
                  <span className="text-[10px] text-slate-400 ml-2">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-white">
                  ₹{order.totalAmount}
                </span>
              </div>

              {/* Items */}
              <div className="space-y-1.5">
                {order.items.map((item) => {
                  const isAdded = addedItems.has(item.menuItem.id);
                  const isUnavailable = !item.menuItem.isAvailable;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-1.5 text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            item.menuItem.isVeg ? 'bg-emerald-400' : 'bg-rose-400'
                          }`}
                        />
                        <span className={`${isUnavailable ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                          {item.quantity}× {item.menuItem.name}
                        </span>
                        {isUnavailable && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold">
                            Sold Out
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleReorderItem(item)}
                        disabled={isAdded || isUnavailable}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center space-x-1 transition-all ${
                          isAdded
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : isUnavailable
                            ? 'bg-charcoal-800 text-slate-600 cursor-not-allowed'
                            : 'bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30 active:scale-95'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Sparkles className="w-3 h-3" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3" />
                            <span>Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Reorder All Button */}
              <button
                onClick={() => handleReorderAll(order)}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-orange-500/20 to-amber-500/10 border border-orange-500/30 text-orange-400 font-bold text-xs flex items-center justify-center space-x-1.5 hover:from-orange-500/30 hover:to-amber-500/20 transition-all active:scale-[0.98]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reorder Entire Meal</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
