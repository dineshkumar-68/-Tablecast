import React, { useState } from 'react';
import { useCart, PlacedOrderSummary } from '../context/CartContext';
import { TableInfo } from '../types';
import { ModalPortal } from './ModalPortal';
import { X, Trash2, Plus, Minus, AlertCircle, ChefHat } from 'lucide-react';

interface CartDrawerProps {
  table: TableInfo | null;
  onOrderSuccess: (order: PlacedOrderSummary) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ table, onOrderSuccess }) => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotalAmount,
    customerNotes,
    setCustomerNotes,
    clearCart,
    setActiveOrder,
  } = useCart();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const handlePlaceOrder = async () => {
    if (!table) {
      setErrorMessage('No active table detected. Please scan table QR.');
      return;
    }

    if (cart.length === 0) {
      setErrorMessage('Your cart is empty. Add some delicious dishes first.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        table_token: table.qrToken,
        customerNotes,
        items: cart.map((cartItem) => ({
          menuItemId: cartItem.item.id,
          quantity: cartItem.quantity,
          addonIds: cartItem.selectedAddons.map((a) => a.id),
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order.');
      }

      // Order created successfully
      const placedOrder: PlacedOrderSummary = {
        id: data.order.id,
        orderNumber: data.order.orderNumber,
        tableNumber: data.order.tableNumber,
        trackingToken: data.order.trackingToken,
        status: data.order.status,
        totalAmount: data.order.totalAmount,
        prepTimeMinutes: data.order.prepTimeMinutes,
      };

      setActiveOrder(placedOrder);
      clearCart();
      setIsCartOpen(false);
      onOrderSuccess(placedOrder);
    } catch (err: any) {
      console.error('Order error:', err);
      setErrorMessage(err.message || 'Something went wrong while placing your order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalPortal
      isOpen={isCartOpen}
      onClose={() => setIsCartOpen(false)}
      backdropClassName="fixed inset-0 z-[999] flex justify-end bg-black/75 backdrop-blur-sm animate-fadeIn overflow-hidden"
      containerClassName="z-[1000] w-full max-w-md bg-charcoal-900 border-l border-white/10 h-full flex flex-col justify-between shadow-2xl animate-slideLeft pointer-events-auto"
    >
      {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
              <ChefHat className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-serif">Your Order</h2>
              <p className="text-[11px] text-orange-300 font-medium">
                {table ? `${table.tableNumber}` : 'Table Not Set'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="w-8 h-8 rounded-full bg-charcoal-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {cart.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-charcoal-800 flex items-center justify-center text-slate-500">
                <ChefHat className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-300">Your cart is empty</p>
              <p className="text-xs text-slate-500 mt-1">
                Explore our woodfire dishes and add your favorites!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((cartItem) => (
                <div
                  key={cartItem.id}
                  className="glass-card p-3 rounded-2xl border border-white/5 flex gap-3"
                >
                  <img
                    src={cartItem.item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80'}
                    alt={cartItem.item.name}
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      if (!img.dataset.errored) {
                        img.dataset.errored = 'true';
                        img.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80';
                      }
                    }}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 bg-charcoal-800"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                        {cartItem.item.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(cartItem.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Add-ons list if any */}
                    {cartItem.selectedAddons.length > 0 && (
                      <div className="text-[10px] text-orange-300/80 my-1 space-x-1">
                        <span>+ {cartItem.selectedAddons.map((a) => a.name).join(', ')}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-bold text-orange-300">
                        ₹{cartItem.lineTotal}
                      </span>

                      <div className="flex items-center space-x-2 bg-charcoal-800 border border-white/10 rounded-lg p-0.5">
                        <button
                          onClick={() => updateQuantity(cartItem.id, cartItem.quantity - 1)}
                          className="w-5 h-5 rounded bg-charcoal-700 hover:bg-charcoal-600 flex items-center justify-center text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-white w-4 text-center">
                          {cartItem.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                          className="w-5 h-5 rounded bg-charcoal-700 hover:bg-charcoal-600 flex items-center justify-center text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Kitchen Special Notes */}
              <div className="pt-2">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Special Kitchen Request
                </label>
                <textarea
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="e.g., Less spicy, no onions, extra cutlery..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50"
                />
              </div>

              {/* Bill Summary matching Slide 4 & 5 */}
              <div className="p-3.5 rounded-2xl bg-charcoal-950 border border-white/5 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="text-slate-200 font-semibold font-mono">₹{subtotalAmount}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Taxes & Charges</span>
                  <span className="text-slate-200 font-semibold font-mono">₹40</span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between font-bold text-sm text-white">
                  <span>Total</span>
                  <span className="text-orange-400 font-mono font-bold text-base">
                    ₹{subtotalAmount + 40}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Bottom Actions matching Slide 4 & 5 */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-white/10 bg-charcoal-950">
            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center space-x-2 shadow-glow active:scale-98 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending to Kitchen...</span>
                </div>
              ) : (
                <span>PLACE ORDER</span>
              )}
            </button>
          </div>
        )}
    </ModalPortal>
  );
};
