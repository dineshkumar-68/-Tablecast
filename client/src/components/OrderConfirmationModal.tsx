import React from 'react';
import { PlacedOrderSummary } from '../context/CartContext';
import { ModalPortal } from './ModalPortal';
import { Check, X } from 'lucide-react';

interface OrderConfirmationModalProps {
  order: PlacedOrderSummary | null;
  onTrack: () => void;
  onClose: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  onTrack,
  onClose,
}) => {
  if (!order) return null;

  return (
    <ModalPortal isOpen={!!order} onClose={onClose}>
      <div
        className="w-full max-w-sm bg-charcoal-900 border border-white/10 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden animate-slideUp pointer-events-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Large Green Checkmark matching Slide 4 & 5 */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-950/50">
          <Check className="w-8 h-8 text-emerald-400 stroke-[3]" />
        </div>

        <h2 className="text-xl font-bold text-emerald-400 uppercase tracking-wide mb-4">
          ORDER CONFIRMED!
        </h2>

        {/* Order Details matching Slide 4 & 5 */}
        <div className="space-y-3 mb-5 text-sm">
          <div>
            <span className="text-slate-400 text-xs block">Order ID</span>
            <span className="font-mono font-bold text-white text-base">{order.orderNumber}</span>
          </div>

          <div>
            <span className="text-slate-400 text-xs block">Table</span>
            <span className="font-bold text-white text-base">
              {order.tableNumber.replace('Table ', '')}
            </span>
          </div>

          <p className="text-xs text-slate-300 italic pt-1">
            Your order has been sent to the kitchen.
          </p>

          <div className="pt-2">
            <span className="text-slate-400 text-xs block">Estimated Time</span>
            <span className="font-bold text-orange-400 text-sm">15 – 20 Min</span>
          </div>
        </div>

        {/* Action Button matching Slide 4 & 5 */}
        <button
          onClick={onTrack}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm uppercase tracking-wider shadow-glow active:scale-98 transition-all"
        >
          TRACK ORDER
        </button>
      </div>
    </ModalPortal>
  );
};
