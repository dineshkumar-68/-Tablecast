import React from 'react';
import { MenuItem } from '../types';
import { Sparkles, Plus } from 'lucide-react';

interface RecommendedPairingsProps {
  items: MenuItem[];
  onSelectItem: (item: MenuItem) => void;
}

export const RecommendedPairings: React.FC<RecommendedPairingsProps> = ({
  items,
  onSelectItem,
}) => {
  // Take top 3 popular pairings
  const recommendations = items.filter((i) => i.isPopular).slice(0, 3);

  if (recommendations.length === 0) return null;

  return (
    <div className="my-6 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-950/50 via-charcoal-900 to-amber-950/40 border border-amber-500/30 shadow-card">
      <div className="flex items-center space-x-2 mb-3">
        <Sparkles className="w-4 h-4 text-amber-400" />
        <h3 className="text-xs sm:text-sm font-serif font-bold text-amber-200 tracking-wide">
          Chef's Recommended Pairings
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {recommendations.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectItem(item)}
            className="glass-card p-3 rounded-2xl border border-amber-500/10 hover:border-amber-500/40 transition-all flex items-center justify-between gap-2 cursor-pointer group"
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <img
                src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80'}
                alt={item.name}
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  if (!img.dataset.errored) {
                    img.dataset.errored = 'true';
                    img.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80';
                  }
                }}
                className="w-10 h-10 rounded-xl object-cover shrink-0 bg-charcoal-800"
              />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-serif font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                  {item.name}
                </p>
                <span className="text-xs font-serif font-extrabold text-amber-300">₹{item.price}</span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectItem(item);
              }}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500 border border-amber-500/30 text-amber-300 hover:text-charcoal-950 text-xs font-bold transition-all duration-200 shrink-0"
              aria-label={`Add ${item.name} to order`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
