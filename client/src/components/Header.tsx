import React from 'react';
import { TableInfo, RestaurantInfo, CustomerSession } from '../types';
import { ClocheLogo } from './ClocheLogo';
import { User, LogOut, Smartphone, Monitor } from 'lucide-react';

interface HeaderProps {
  table: TableInfo | null;
  restaurant: RestaurantInfo | null;
  customerSession?: CustomerSession | null;
  onLogout?: () => void;
  viewMode?: 'DESKTOP' | 'MOBILE_SIMULATOR';
  onToggleViewMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  table,
  restaurant,
  customerSession,
  onLogout,
  viewMode = 'DESKTOP',
  onToggleViewMode,
}) => {
  return (
    <header className="sticky top-0 z-30 glass-panel border-b border-white/10 px-4 py-3 sm:px-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Restaurant Identity */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center shadow-glow text-charcoal-950">
            <ClocheLogo className="w-6 h-6 text-charcoal-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-serif font-bold text-lg sm:text-xl tracking-tight text-stone-100">
                {restaurant?.name || 'Tablecast'}
              </h1>
            </div>
            <p className="text-[10px] sm:text-[11px] uppercase tracking-widest text-amber-300/90 font-bold">
              {restaurant?.tagline || 'TABLE-WISE ARTISANAL DINING'}
            </p>
          </div>
        </div>

        {/* Right Section: Customer, Table & Mode Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Device Mode Switcher (Desktop Monitor vs Mobile Phone View) */}
          {onToggleViewMode && (
            <button
              onClick={onToggleViewMode}
              className={`hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                viewMode === 'MOBILE_SIMULATOR'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-glow'
                  : 'bg-stone-900/80 text-stone-300 border-stone-800 hover:border-amber-500/30'
              }`}
              title="Toggle between Mobile Phone Frame and Desktop Wide View"
            >
              {viewMode === 'MOBILE_SIMULATOR' ? (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mobile Portal</span>
                </>
              ) : (
                <>
                  <Monitor className="w-3.5 h-3.5 text-amber-400" />
                  <span>Computer Portal</span>
                </>
              )}
            </button>
          )}

          {/* Customer Badge */}
          {customerSession && (
            <div className="hidden sm:flex items-center space-x-1.5 bg-charcoal-900/90 border border-amber-500/30 px-3 py-1.5 rounded-full text-xs text-amber-200 shadow-sm">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-medium">{customerSession.name}</span>
              <span className="text-stone-600">•</span>
              <span className="text-stone-400">{customerSession.partySize} Guests</span>
            </div>
          )}

          {/* Table Banner */}
          {table && (
            <div className="flex items-center space-x-2 bg-gradient-to-r from-amber-950/80 via-charcoal-900 to-amber-950/60 border border-amber-500/40 px-3 py-1.5 rounded-full shadow-glow">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-xs sm:text-sm font-extrabold tracking-wider text-amber-200 uppercase">
                {table.tableNumber}
              </span>
            </div>
          )}

          {customerSession && onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 rounded-full text-stone-400 hover:text-red-400 hover:bg-stone-800 transition"
              title="End Session & Switch Guest"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}

          <a
            href="/admin"
            className="hidden xs:inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-charcoal-900/80 hover:bg-charcoal-800 text-stone-400 hover:text-amber-300 border border-amber-500/20 hover:border-amber-500/40 text-[11px] font-semibold transition-all"
            title="Kitchen & Admin Dashboard"
          >
            <span>Kitchen</span>
          </a>
        </div>
      </div>
    </header>
  );
};
