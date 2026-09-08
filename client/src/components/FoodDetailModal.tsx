import React, { useState } from 'react';
import { MenuItem, MenuItemAddon } from '../types';
import { useCart } from '../context/CartContext';
import { ModalPortal } from './ModalPortal';
import { X, Flame, Clock, Check, Plus, Minus, ShoppingBag } from 'lucide-react';

interface FoodDetailModalProps {
  item: MenuItem | null;
  onClose: () => void;
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({
  item,
  onClose,
}) => {
  const { addToCart, setIsCartOpen } = useCart();
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedAddons, setSelectedAddons] = useState<MenuItemAddon[]>([]);
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);

  if (!item) return null;

  const toggleAddon = (addon: MenuItemAddon) => {
    if (selectedAddons.some((a) => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter((a) => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const totalItemPrice = (item.price + addonsTotal) * quantity;

  const handleAddToCart = () => {
    addToCart(item, quantity, selectedAddons);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
      setIsCartOpen(true);
    }, 400);
  };

  return (
    <ModalPortal isOpen={!!item} onClose={onClose}>
      {/* Modal Container */}
      <div
        className="w-full max-w-lg bg-bg-surface border border-border-subtle rounded-3xl overflow-hidden shadow-card max-h-[88vh] flex flex-col relative animate-slideUp my-auto"
      >
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-black/70 text-white/80 hover:text-white border border-white/10 flex items-center justify-center transition-all hover:scale-105"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Hero Image - Controlled height h-44 sm:h-52 so it never eclipses the modal content */}
        <div className="relative h-44 sm:h-52 w-full shrink-0 bg-bg-primary overflow-hidden">
          <img
            src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}
            alt={item.name}
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              if (!img.dataset.errored) {
                img.dataset.errored = 'true';
                img.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
              }
            }}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

          {/* Badges Overlay */}
          <div className="absolute bottom-3 left-4 flex items-center space-x-2 z-10">
            <div
              className={`w-5 h-5 rounded-md flex items-center justify-center border shadow-sm ${
                item.isVeg
                  ? 'bg-charcoal-900/90 border-emerald-500 text-emerald-500'
                  : 'bg-charcoal-900/90 border-rose-500 text-rose-500'
              }`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
            </div>
            {item.isPopular && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm">
                <Flame className="w-2.5 h-2.5 mr-1 fill-white" /> Chef's Recommendation
              </span>
            )}
            <div className="flex items-center px-2 py-0.5 rounded-md bg-black/60 text-slate-300 text-[10px] font-medium border border-white/10">
              <Clock className="w-3 h-3 mr-1 text-orange-400" />
              <span>{item.prepTimeMinutes} mins prep</span>
            </div>
          </div>
        </div>

        {/* Modal Body - Scrollable content area */}
        <div className="p-5 overflow-y-auto flex-1 min-h-0 space-y-5 custom-scrollbar">
          {/* Header & Description */}
          <div>
            <div className="flex items-baseline justify-between mb-1">
              <h2 className="text-lg sm:text-xl font-bold text-white font-serif">{item.name}</h2>
              <span className="text-base sm:text-lg font-bold text-orange-400 font-mono">
                ₹{item.price}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Customisations & Add-ons */}
          {item.addons && item.addons.length > 0 && (
            <div className="pt-3 border-t border-white/5">
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Customise & Add-ons
                </h4>
                <span className="text-[10px] text-slate-400">Optional</span>
              </div>
              <div className="space-y-2">
                {item.addons.map((addon) => {
                  const isSelected = selectedAddons.some((a) => a.id === addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddon(addon)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-orange-500/10 border-orange-500/40 text-white'
                          : 'bg-charcoal-800/60 border-white/5 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                            isSelected
                              ? 'bg-orange-500 border-orange-500 text-white'
                              : 'border-slate-600 bg-charcoal-900'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <span className="text-xs sm:text-sm font-medium">{addon.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-orange-300 font-mono">
                        +₹{addon.price}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Quantity
            </span>
            <div className="flex items-center space-x-3 bg-charcoal-800 border border-white/10 rounded-xl p-1">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="w-7 h-7 rounded-lg bg-charcoal-700 hover:bg-charcoal-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white transition-all"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-sm font-bold text-white w-5 text-center font-mono">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-7 h-7 rounded-lg bg-charcoal-700 hover:bg-charcoal-600 flex items-center justify-center text-white transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Bottom Bar - Pinned to bottom with shrink-0 */}
        <div className="p-4 bg-charcoal-950 border-t border-white/10 flex items-center justify-between shrink-0 z-20">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-medium">Item Total</span>
            <span className="text-lg font-bold text-orange-400 font-mono">
              ₹{totalItemPrice}
            </span>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={addedAnimation}
            className="px-7 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold uppercase tracking-wider shadow-glow flex items-center space-x-2 transition-all active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{addedAnimation ? 'ADDED!' : 'ADD TO CART'}</span>
          </button>
        </div>
      </div>
    </ModalPortal>
  );
};
