import React, { useState, useEffect } from 'react';
import { Search, X, Flame, Leaf } from 'lucide-react';

interface SearchBarAndFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  dietFilter: 'ALL' | 'VEG' | 'NON_VEG' | 'JAIN' | 'VEGAN';
  onDietFilterChange: (f: 'ALL' | 'VEG' | 'NON_VEG' | 'JAIN' | 'VEGAN') => void;
  popularOnly: boolean;
  onTogglePopular: () => void;
}

const PLACEHOLDERS = [
  'Search for Truffle Mushroom Risotto...',
  'Search for Woodfire Margherita Pizza...',
  'Search for Paneer Tikka...',
  'Search for Cold Coffee & Shakes...',
];

export const SearchBarAndFilters: React.FC<SearchBarAndFiltersProps> = ({
  searchQuery,
  onSearchChange,
  dietFilter,
  onDietFilterChange,
  popularOnly,
  onTogglePopular,
}) => {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-3 pb-2 space-y-3">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ember-500">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={PLACEHOLDERS[placeholderIndex]}
          className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-bg-surface border border-border-subtle hover:border-ember-500/40 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-ember-500 focus:ring-1 focus:ring-ember-500/30 transition-all shadow-inner"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-muted hover:text-text-primary"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Promo Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/70 via-bg-surface to-amber-900/40 border border-ember-500/30 flex items-center justify-between shadow-card relative overflow-hidden group">
        <div className="relative z-10">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-gold-highlight block mb-0.5">
            TODAY'S CHEF SPECIAL
          </span>
          <h2 className="text-sm sm:text-base font-serif font-bold text-text-primary">
            Get 20% OFF on Combos & Woodfire Pizza
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">Scan. Order. Relax. We take care of the rest.</p>
        </div>

        <div className="relative z-10 w-12 h-12 rounded-xl bg-ember-gradient/20 border border-ember-500/40 flex items-center justify-center shrink-0 shadow-glow">
          <Flame className="w-6 h-6 text-ember-500 animate-pulse" />
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1 text-xs">
        <button
          onClick={() => onDietFilterChange('ALL')}
          className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
            dietFilter === 'ALL'
              ? 'bg-bg-surface-2 text-text-primary border border-border-subtle shadow-sm'
              : 'bg-bg-surface text-text-muted border border-border-subtle/50 hover:text-text-primary'
          }`}
        >
          All
        </button>

        <button
          onClick={() => onDietFilterChange(dietFilter === 'VEG' ? 'ALL' : 'VEG')}
          className={`px-3.5 py-1.5 rounded-xl font-semibold flex items-center space-x-1.5 transition-all ${
            dietFilter === 'VEG'
              ? 'bg-emerald-950/70 text-status-veg border border-status-veg/50 shadow-sm'
              : 'bg-bg-surface text-text-muted border border-border-subtle/50 hover:text-status-veg'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-status-veg ring-2 ring-status-veg/30"></span>
          <span>Veg</span>
        </button>

        <button
          onClick={() => onDietFilterChange(dietFilter === 'NON_VEG' ? 'ALL' : 'NON_VEG')}
          className={`px-3.5 py-1.5 rounded-xl font-semibold flex items-center space-x-1.5 transition-all ${
            dietFilter === 'NON_VEG'
              ? 'bg-rose-950/70 text-status-nonveg border border-status-nonveg/50 shadow-sm'
              : 'bg-bg-surface text-text-muted border border-border-subtle/50 hover:text-status-nonveg'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-status-nonveg ring-2 ring-status-nonveg/30"></span>
          <span>Non-Veg</span>
        </button>

        <button
          onClick={() => onDietFilterChange(dietFilter === 'JAIN' ? 'ALL' : 'JAIN')}
          className={`px-3.5 py-1.5 rounded-xl font-semibold flex items-center space-x-1.5 transition-all ${
            dietFilter === 'JAIN'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'bg-bg-surface text-text-muted border border-border-subtle/50 hover:text-amber-300'
          }`}
        >
          <span>Jain</span>
        </button>

        <button
          onClick={() => onDietFilterChange(dietFilter === 'VEGAN' ? 'ALL' : 'VEGAN')}
          className={`px-3.5 py-1.5 rounded-xl font-semibold flex items-center space-x-1.5 transition-all ${
            dietFilter === 'VEGAN'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'bg-bg-surface text-text-muted border border-border-subtle/50 hover:text-emerald-300'
          }`}
        >
          <Leaf className="w-3.5 h-3.5 text-emerald-400" />
          <span>Vegan</span>
        </button>

        <button
          onClick={onTogglePopular}
          className={`px-3.5 py-1.5 rounded-xl font-semibold flex items-center space-x-1.5 transition-all ${
            popularOnly
              ? 'bg-ember-gradient text-bg-primary font-bold shadow-glow'
              : 'bg-bg-surface text-text-muted border border-border-subtle/50 hover:text-gold-highlight'
          }`}
        >
          <Flame className={`w-3.5 h-3.5 ${popularOnly ? 'text-bg-primary fill-bg-primary' : 'text-text-muted'}`} />
          <span>Bestsellers</span>
        </button>
      </div>
    </div>
  );
};

