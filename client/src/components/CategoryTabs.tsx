import React from 'react';
import { motion } from 'framer-motion';
import { MenuCategory } from '../types';

interface CategoryTabsProps {
  categories: MenuCategory[];
  activeCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  totalItemsCount: number;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  activeCategoryId,
  onSelectCategory,
  totalItemsCount,
}) => {
  const allTabs = [
    { id: 'ALL', name: 'All Items', count: totalItemsCount },
    ...categories.map((cat) => ({ id: cat.id, name: cat.name, count: cat.items.length })),
  ];

  return (
    <div className="sticky top-[61px] z-20 bg-bg-primary/95 backdrop-blur-md border-b border-border-subtle py-2.5 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
        {allTabs.map((tab) => {
          const isActive = activeCategoryId === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectCategory(tab.id)}
              className="relative shrink-0 px-4 py-2 rounded-full text-xs font-semibold flex items-center space-x-2 transition-colors focus:outline-none"
            >
              {isActive && (
                <motion.div
                  layoutId="activeCategoryPill"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className="absolute inset-0 bg-ember-gradient rounded-full shadow-glow"
                />
              )}
              <span className={`relative z-10 font-bold ${isActive ? 'text-bg-primary font-extrabold' : 'text-stone-300 hover:text-white font-semibold'}`}>
                {tab.name}
              </span>
              <span
                className={`relative z-10 px-1.5 py-0.2 rounded-full text-[10px] tabular-nums font-bold ${
                  isActive
                    ? 'bg-bg-primary/30 text-bg-primary font-black'
                    : 'bg-bg-surface-2 text-stone-300 font-bold border border-border-subtle'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
