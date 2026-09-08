import React, { useState } from 'react';
import { TableInfo } from '../types';
import { useCart, PlacedOrderSummary, CartItem } from '../context/CartContext';
import { ShoppingBag, Utensils, Trash2, Plus, Minus, Send, AlertCircle } from 'lucide-react';

interface DesktopCartSidebarProps {
  table: TableInfo | null;
  onOrderSuccess: (summary: PlacedOrderSummary) => void;
}

export const DesktopCartSidebar: React.FC<DesktopCartSidebarProps> = ({
  table,
  onOrderSuccess,
}) => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotalAmount,
    taxAmount,
    totalPayableAmount,
    totalItemsCount,
    customerNotes,
    setCustomerNotes,
    setActiveOrder,
  } = useCart();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    if (!table) {
      setError('Table information missing. Please re-scan QR code.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const orderPayload = {
        tableId: table.id,
        items: cart.map((cartItem: CartItem) => ({
          menuItemId: cartItem.item.id,
          quantity: cartItem.quantity,
          addons: cartItem.selectedAddons.map((a) => a.id),
        })),
        customerNotes: customerNotes.trim() || undefined,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order.');
      }

      const summary: PlacedOrderSummary = {
        id: data.order.id,
        orderNumber: data.order.orderNumber,
        tableNumber: table.tableNumber,
        trackingToken: data.order.trackingToken,
        status: data.order.status || 'PLACED',
        totalAmount: data.order.totalAmount,
        prepTimeMinutes: data.order.prepTimeMinutes || 15,
      };

      setActiveOrder(summary);
      clearCart();
      setCustomerNotes('');
      onOrderSuccess(summary);
    } catch (err) {
      console.error('Order placement error:', err);
      setError(err instanceof Error ? err.message : 'Error placing order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <aside className="hidden lg:flex flex-col w-80 shrink-0 bg-stone-900/90 border border-stone-800/80 rounded-3xl p-5 shadow-2xl backdrop-blur-xl sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-hidden">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-800/80">
        <div className="flex items-center space-x-2 text-stone-100 font-serif font-bold text-base">
          <ShoppingBag className="w-5 h-5 text-amber-400" />
          <span>Your Table Cart</span>
        </div>
        <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full font-semibold">
          {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
        </span>
      </div>

      {error && (
        <div className="mt-3 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1 no-scrollbar min-h-[160px]">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-stone-500 py-10">
            <Utensils className="w-10 h-10 mb-2 opacity-40 text-stone-400" />
            <p className="text-xs font-medium">Your cart is empty.</p>
            <p className="text-[11px] text-stone-600 mt-1 max-w-[180px]">
              Select delicious woodfire dishes from the menu to build your table order.
            </p>
          </div>
        ) : (
          cart.map((cartItem: CartItem) => (
            <div
              key={cartItem.id}
              className="bg-stone-950/70 border border-stone-800/80 rounded-2xl p-3.5 flex flex-col space-y-2 group hover:border-amber-500/30 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-2">
                  <div className="flex items-center space-x-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        cartItem.item.isVeg ? 'bg-emerald-400' : 'bg-red-500'
                      }`}
                    />
                    <h5 className="text-xs font-bold text-stone-100 line-clamp-1">
                      {cartItem.item.name}
                    </h5>
                  </div>
                  {cartItem.selectedAddons.length > 0 && (
                    <p className="text-[10px] text-amber-400/90 mt-0.5">
                      + {cartItem.selectedAddons.map((a) => a.name).join(', ')}
                    </p>
                  )}
                  <p className="text-xs font-semibold text-amber-300 mt-1">
                    ₹{cartItem.lineTotal.toFixed(2)}
                  </p>
                </div>

                <button
                  onClick={() => removeFromCart(cartItem.id)}
                  className="text-stone-500 hover:text-red-400 p-1 rounded-lg transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center justify-between pt-2 border-t border-stone-800/60">
                <span className="text-[10px] text-stone-400">Qty</span>
                <div className="flex items-center space-x-2 bg-stone-900 border border-stone-700/80 rounded-xl px-2 py-1">
                  <button
                    onClick={() => updateQuantity(cartItem.id, cartItem.quantity - 1)}
                    className="text-stone-400 hover:text-white transition"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold text-stone-100 min-w-[16px] text-center">
                    {cartItem.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                    className="text-stone-400 hover:text-white transition"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart Summary & Order Action */}
      {cart.length > 0 && (
        <div className="pt-4 border-t border-stone-800/80 space-y-3">
          {/* Notes Input */}
          <div>
            <textarea
              rows={2}
              placeholder="Add kitchen notes (e.g. Less spicy, extra sauce)..."
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              className="w-full bg-stone-950/80 border border-stone-800 text-stone-200 text-xs rounded-xl p-2.5 placeholder-stone-500 focus:border-amber-500/60 outline-none resize-none"
            />
          </div>

          {/* Pricing Details */}
          <div className="space-y-1.5 text-xs text-stone-300">
            <div className="flex justify-between text-stone-400">
              <span>Subtotal</span>
              <span>₹{subtotalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-stone-400">
              <span>Taxes & GST (5%)</span>
              <span>₹{taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-stone-100 pt-2 border-t border-stone-800/60">
              <span>Total Amount</span>
              <span className="text-amber-400 font-serif">₹{totalPayableAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Place Order CTA */}
          <button
            onClick={handlePlaceOrder}
            disabled={isSubmitting}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold text-xs shadow-lg shadow-amber-900/30 transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                <span>Sending to Kitchen...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Send Order to Kitchen (₹{totalPayableAmount.toFixed(0)})</span>
              </>
            )}
          </button>
        </div>
      )}
    </aside>
  );
};
