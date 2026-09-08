import React from 'react';
import { useCart } from '../context/CartContext';
import { Utensils, Search, ShoppingBag, Clock } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'MENU' | 'SEARCH' | 'TRACKING';
  onSelectTab: (tab: 'MENU' | 'SEARCH' | 'TRACKING') => void;
  onToggleSearchFocus?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  onToggleSearchFocus,
}) => {
  const { setIsCartOpen, totalItemsCount, activeOrder } = useCart();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-950/95 border-t border-stone-800/80 backdrop-blur-xl px-4 py-2 flex items-center justify-around shadow-2xl safe-area-pb">
      {/* 1. Menu Tab */}
      <button
        onClick={() => onSelectTab('MENU')}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition ${
          activeTab === 'MENU'
            ? 'text-amber-400 bg-amber-500/10 font-bold'
            : 'text-stone-400 hover:text-stone-200'
        }`}
      >
        <Utensils className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-wide">Menu</span>
      </button>

      {/* 2. Quick Search Tab */}
      <button
        onClick={() => {
          onSelectTab('SEARCH');
          if (onToggleSearchFocus) onToggleSearchFocus();
        }}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition ${
          activeTab === 'SEARCH'
            ? 'text-amber-400 bg-amber-500/10 font-bold'
            : 'text-stone-400 hover:text-stone-200'
        }`}
      >
        <Search className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-wide">Search</span>
      </button>

      {/* 3. Cart Button with Badge */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl text-amber-300 hover:text-amber-200 group"
      >
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-stone-950 shadow-md shadow-amber-900/40 group-active:scale-95 transition-transform">
            <ShoppingBag className="w-5 h-5" />
          </div>
          {totalItemsCount > 0 && (
            <span className="absolute -top-1 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white font-bold text-[10px] flex items-center justify-center shadow-md animate-bounce">
              {totalItemsCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold text-amber-400 mt-0.5">Cart</span>
      </button>

      {/* 4. Active Order Tracker Tab */}
      <button
        onClick={() => onSelectTab('TRACKING')}
        className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition ${
          activeTab === 'TRACKING'
            ? 'text-amber-400 bg-amber-500/10 font-bold'
            : 'text-stone-400 hover:text-stone-200'
        }`}
      >
        <div className="relative">
          <Clock className="w-5 h-5 mb-0.5" />
          {activeOrder && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          )}
        </div>
        <span className="text-[10px] tracking-wide">Status</span>
      </button>
    </div>
  );
};
