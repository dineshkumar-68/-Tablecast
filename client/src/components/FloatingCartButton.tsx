import React from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingBag, ArrowRight, Activity } from 'lucide-react';

interface FloatingCartButtonProps {
  onOpenTracker: () => void;
}

export const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({ onOpenTracker }) => {
  const { totalItemsCount, subtotalAmount, setIsCartOpen, activeOrder } = useCart();
  const [isMinimized, setIsMinimized] = React.useState<boolean>(false);

  if (totalItemsCount === 0 && !activeOrder) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-charcoal-950/95 border-t border-white/10 backdrop-blur-xl py-2.5 px-4 sm:px-6 shadow-2xl flex justify-center transition-all">
      <div className="flex items-center gap-3 max-w-5xl w-full">
        {/* Active Live Order Tracker Dock if an order is active */}
        {activeOrder && (
          <div className="flex-1 flex items-center gap-2">
            {!isMinimized ? (
              <div className="flex-1 flex items-center justify-between py-2 px-3.5 rounded-xl bg-charcoal-900 border border-orange-500/30 text-orange-300 text-xs sm:text-sm font-semibold">
                <button
                  onClick={onOpenTracker}
                  className="flex items-center space-x-2 text-left hover:text-orange-200 transition-colors flex-1"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0"></span>
                  <Activity className="w-4 h-4 text-orange-400 shrink-0" />
                  <span className="truncate">Track Order #{activeOrder.orderNumber}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 uppercase tracking-wider font-extrabold ml-1 hidden sm:inline-block">
                    {activeOrder.status}
                  </span>
                </button>
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors ml-2"
                  title="Minimize tracker banner"
                  aria-label="Minimize tracker banner"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsMinimized(false)}
                className="py-2 px-3 rounded-xl bg-charcoal-900 border border-orange-500/30 text-orange-400 text-xs font-semibold flex items-center space-x-1.5 hover:bg-charcoal-800 transition-colors"
                title="Expand order tracker"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>#{activeOrder.orderNumber}</span>
              </button>
            )}
          </div>
        )}

        {/* View Cart Button if cart has items */}
        {totalItemsCount > 0 && (
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-charcoal-950 font-extrabold text-xs sm:text-sm flex items-center justify-between shadow-glow hover:brightness-110 transition-all"
          >
            <div className="flex items-center space-x-2">
              <div className="relative">
                <ShoppingBag className="w-4 h-4 text-charcoal-950" />
                <span className="absolute -top-1 -right-1.5 bg-charcoal-950 text-orange-300 text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {totalItemsCount}
                </span>
              </div>
              <span>View Cart</span>
            </div>

            <div className="flex items-center space-x-1.5">
              <span>₹{subtotalAmount}</span>
              <ArrowRight className="w-4 h-4 text-charcoal-950" />
            </div>
          </button>
        )}
      </div>
    </div>
  );
};
