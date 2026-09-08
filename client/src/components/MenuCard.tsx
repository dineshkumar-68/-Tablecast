import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuItem } from '../types';
import { Flame, Clock, Plus } from 'lucide-react';

interface MenuCardProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
}

interface EmberParticle {
  id: number;
  x: number;
  y: number;
}

export const MenuCard: React.FC<MenuCardProps> = ({ item, onSelect }) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [particles, setParticles] = useState<EmberParticle[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Max 6deg tilt
    setRotateX((-y / (rect.height / 2)) * 6);
    setRotateY((x / (rect.width / 2)) * 6);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const triggerEmberBurst = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newParticles: EmberParticle[] = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 40,
      y: -Math.random() * 30 - 10,
    }));
    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.includes(p)));
    }, 600);

    onSelect(item);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelect(item)}
      animate={{ rotateX, rotateY }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{ perspective: 800, transformStyle: 'preserve-3d' }}
      className="glass-card rounded-2xl overflow-hidden border border-border-subtle hover:border-ember-500/40 transition-shadow duration-300 hover:shadow-glow cursor-pointer flex flex-col justify-between group relative"
    >
      <div>
        {/* Image Container with 3D Parallax */}
        <div
          className="relative aspect-[16/10] overflow-hidden bg-bg-surface-2"
          style={{ transform: 'translateZ(12px)' }}
        >
          <img
            src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}
            alt={item.name}
            loading="lazy"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              if (!img.dataset.errored) {
                img.dataset.errored = 'true';
                img.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
              }
            }}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

          {/* Badges on Image */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
            {/* Veg / Non-Veg Indicator */}
            <div
              className={`w-5 h-5 rounded-md flex items-center justify-center border shadow-sm ${
                item.isVeg
                  ? 'bg-bg-surface/90 border-[#34D399]'
                  : 'bg-bg-surface/90 border-[#F0725A]'
              }`}
              title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  item.isVeg ? 'bg-[#34D399]' : 'bg-[#F0725A]'
                }`}
              />
            </div>

            {/* Popular / Bestseller Badge */}
            {item.isPopular && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-ember-gradient text-bg-primary shadow-sm tracking-wide">
                <Flame className="w-2.5 h-2.5 mr-1 fill-bg-primary text-bg-primary animate-pulse" /> Bestseller
              </span>
            )}
          </div>

          {/* Prep Time Badge */}
          <div className="absolute bottom-2.5 right-2.5 flex items-center px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-text-secondary text-[10px] font-medium border border-border-subtle">
            <Clock className="w-3 h-3 mr-1 text-ember-500" />
            <span>{item.prepTimeMinutes} mins</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4" style={{ transform: 'translateZ(4px)' }}>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-serif font-bold text-sm sm:text-base text-white group-hover:text-gold-highlight transition-colors line-clamp-1">
              {item.name}
            </h3>
          </div>
          <p className="text-xs text-stone-200 line-clamp-2 leading-relaxed mb-3">
            {item.description}
          </p>
        </div>
      </div>

      {/* Footer with Price and 3D Add Button */}
      <div
        className="px-4 pb-4 pt-1 flex items-center justify-between border-t border-border-subtle relative"
        style={{ transform: 'translateZ(8px)' }}
      >
        <div>
          <span className="text-[10px] uppercase font-bold text-stone-400 block">Price</span>
          <span className="text-base sm:text-lg font-serif font-bold text-amber-300 tabular-nums">
            ₹{item.price}
          </span>
        </div>

        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={triggerEmberBurst}
            className="btn-ember-primary flex items-center space-x-1.5 px-4 py-1.5 rounded-xl text-xs shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{item.addons && item.addons.length > 0 ? 'Customise' : 'Add'}</span>
          </motion.button>

          {/* Particle Burst Elements */}
          <AnimatePresence>
            {particles.map((p) => (
              <motion.span
                key={p.id}
                initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                animate={{ opacity: 0, scale: 0.2, x: p.x, y: p.y }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-amber-400 pointer-events-none shadow-glow"
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
