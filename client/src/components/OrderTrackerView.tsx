import React, { useState, useEffect } from 'react';
import { PlacedOrderSummary } from '../context/CartContext';
import { useSocket } from '../hooks/useSocket';
import {
  ArrowLeft,
  Utensils,
  Star,
  Send,
  X,
  PhoneCall,
  CreditCard,
  Users,
  Check,
} from 'lucide-react';


interface OrderTrackerViewProps {
  orderSummary: PlacedOrderSummary;
  onBackToMenu: () => void;
}

interface OrderDetailResponse {
  id: string;
  orderNumber: string;
  tableId: string;
  tableNumber: string;
  status: 'PLACED' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED';
  paymentStatus?: string;
  paymentMethod?: string;
  subtotalAmount?: number;
  taxesAndCharges?: number;
  totalAmount: number;
  customerNotes?: string;
  chefAssigned?: string | null;
  acceptedAt?: string | null;
  cookingAt?: string | null;
  readyAt?: string | null;
  servedAt?: string | null;
  feedbackRating?: number | null;
  feedbackComment?: string | null;
  createdAt: string;
  prepTimeMinutes: number;
  items: Array<{
    id: string;
    name: string;
    imageUrl: string;
    isVeg: boolean;
    addedByName?: string;
    quantity: number;
    unitPrice: number;
    addons: Array<{ name: string; price: number }>;
    subtotal: number;
  }>;
}

export const OrderTrackerView: React.FC<OrderTrackerViewProps> = ({
  orderSummary,
  onBackToMenu,
}) => {
  const { socket, joinRoom } = useSocket();
  const [orderDetails, setOrderDetails] = useState<OrderDetailResponse | null>(null);

  // Call waiter state
  const [callingWaiter, setCallingWaiter] = useState(false);

  const [waiterCalledSuccess, setWaiterCalledSuccess] = useState(false);

  // Split bill modal state
  const [showSplitBillModal, setShowSplitBillModal] = useState(false);
  const [headcount, setHeadcount] = useState(2);

  // In-app payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayMethod, setSelectedPayMethod] = useState<'UPI' | 'CARD' | 'CASH'>('UPI');
  const [paying, setPaying] = useState(false);

  // Customer Feedback State
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);
  const [submittingFeedback, setSubmittingFeedback] = useState<boolean>(false);

  const fetchOrderStatus = async () => {
    try {
      const res = await fetch(`/api/orders/${orderSummary.id}`, {
        headers: {
          'x-tracking-token': orderSummary.trackingToken,
        },
      });

      if (!res.ok) {
        throw new Error('Could not fetch order status.');
      }

      const data = await res.json();
      setOrderDetails(data.order);

      if (data.order.feedbackRating) {
        setFeedbackSubmitted(true);
        setRating(data.order.feedbackRating);
      }
    } catch (err: any) {
      console.error('Track error:', err);
    }
  };


  useEffect(() => {
    fetchOrderStatus();
    joinRoom(`order:${orderSummary.id}`);

    if (socket) {
      socket.on('order_status_updated', () => {
        fetchOrderStatus();
      });
      socket.on('order_paid', () => {
        fetchOrderStatus();
      });
    }

    return () => {
      socket?.off('order_status_updated');
      socket?.off('order_paid');
    };
  }, [orderSummary.id, socket]);

  const handleCallWaiter = async (type: string = 'WAITER') => {
    setCallingWaiter(true);
    try {
      const res = await fetch(`/api/orders/${orderSummary.id}/call-waiter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      if (res.ok) {
        setWaiterCalledSuccess(true);
        setTimeout(() => setWaiterCalledSuccess(false), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCallingWaiter(false);
    }
  };

  const handleProcessPayment = async () => {
    setPaying(true);
    try {
      const res = await fetch(`/api/orders/${orderSummary.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod: selectedPayMethod }),
      });
      if (res.ok) {
        await fetchOrderStatus();
        setShowPaymentModal(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPaying(false);
    }
  };

  const currentStatus = orderDetails?.status || orderSummary.status;

  const steps = [
    { key: 'PLACED', label: 'Placed', desc: 'Sent to Kitchen' },
    { key: 'ACCEPTED', label: 'Accepted', desc: 'Chef Acknowledged' },
    { key: 'PREPARING', label: 'Cooking', desc: 'In Oven / Pan' },
    { key: 'READY', label: 'Ready', desc: 'Plated at Pass' },
    { key: 'SERVED', label: 'Served', desc: 'Delivered to Table' },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'PLACED': return 0;
      case 'ACCEPTED': return 1;
      case 'PREPARING': return 2;
      case 'READY': return 3;
      case 'SERVED': return 4;
      default: return 0;
    }
  };

  const activeStepIdx = getStepIndex(currentStatus);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      const res = await fetch(`/api/orders/${orderSummary.id}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tracking-token': orderSummary.trackingToken,
        },
        body: JSON.stringify({ rating, comment }),
      });
      if (res.ok) {
        setFeedbackSubmitted(true);
      }
    } catch (err) {
      console.error('Feedback submit error:', err);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-950 text-slate-100 flex flex-col pb-16 selection:bg-orange-500 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-30 glass-panel border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            onClick={onBackToMenu}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-charcoal-800 text-xs font-semibold text-slate-300 hover:text-white border border-white/10 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Menu</span>
          </button>

          <div className="text-center">
            <h1 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              LIVE ORDER PROGRESS
            </h1>
          </div>

          <div className="flex items-center space-x-1.5 text-[11px] text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>WebSocket Live</span>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto w-full px-4 sm:px-6 py-5 space-y-4">
        {/* Banner with Call Waiter Button */}
        <div className="glass-panel p-5 rounded-3xl border border-white/10 text-center shadow-lg relative overflow-hidden space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-widest text-slate-400 font-bold">
              Order {orderDetails?.orderNumber || orderSummary.orderNumber}
            </span>
            <span className="text-xs font-bold text-orange-400">
              {orderDetails?.tableNumber || orderSummary.tableNumber}
            </span>
          </div>

          <div className="flex items-center justify-center space-x-3 pt-1">
            <button
              onClick={() => handleCallWaiter('WAITER')}
              disabled={callingWaiter}
              className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center space-x-2 shadow-glow transition-all active:scale-95 disabled:opacity-50"
            >
              <PhoneCall className="w-4 h-4 animate-pulse" />
              <span>{callingWaiter ? 'Alerting...' : 'Call Waiter'}</span>
            </button>
            <button
              onClick={() => setShowSplitBillModal(true)}
              className="px-3 py-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-slate-200 border border-white/10 text-xs font-semibold flex items-center space-x-1.5"
            >
              <Users className="w-4 h-4 text-orange-400" />
              <span>Split Bill</span>
            </button>
          </div>

          {waiterCalledSuccess && (
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-semibold animate-fadeIn">
              ✓ Waiter alerted for {(orderDetails?.tableNumber || orderSummary.tableNumber || '').startsWith('Table') ? (orderDetails?.tableNumber || orderSummary.tableNumber) : `Table ${orderDetails?.tableNumber || orderSummary.tableNumber}`}!
            </div>
          )}
        </div>

        {/* Live Step Progress Tracker */}
        <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center">
            Kitchen Ticket Progress
          </h3>
          
          <div className="flex items-center justify-between relative px-2">
            <div className="absolute top-1/2 left-4 right-4 h-1 bg-charcoal-800 -translate-y-1/2 -z-0"></div>
            <div
              className="absolute top-1/2 left-4 h-1 bg-gradient-to-r from-orange-500 to-emerald-500 -translate-y-1/2 -z-0 transition-all duration-500"
              style={{ width: `${(activeStepIdx / (steps.length - 1)) * 90}%` }}
            ></div>

            {steps.map((st, idx) => {
              const isDone = idx <= activeStepIdx;
              const isCurrent = idx === activeStepIdx;

              return (
                <div key={st.key} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                      isCurrent
                        ? 'bg-orange-500 text-white ring-4 ring-orange-500/30 scale-110 shadow-glow'
                        : isDone
                        ? 'bg-emerald-500 text-white'
                        : 'bg-charcoal-900 text-slate-500 border border-white/10'
                    }`}
                  >
                    {isDone ? '✓' : idx + 1}
                  </div>
                  <span className={`text-[10px] font-bold mt-1.5 ${isCurrent ? 'text-orange-400' : 'text-slate-400'}`}>
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Banner & Checkout Trigger */}
        <div className="glass-panel p-4 rounded-3xl border border-orange-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Payment Status</span>
            <span className={`text-xs font-black ${orderDetails?.paymentStatus === 'PAID' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {orderDetails?.paymentStatus === 'PAID' ? `PAID via ${orderDetails?.paymentMethod || 'UPI'}` : 'PENDING'}
            </span>
          </div>

          {orderDetails?.paymentStatus !== 'PAID' && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-charcoal-950 font-black text-xs flex items-center space-x-1.5 shadow-glow"
            >
              <CreditCard className="w-4 h-4" />
              <span>Pay In-App (₹{orderDetails?.totalAmount})</span>
            </button>
          )}
        </div>

        {/* 5-Star Feedback Form */}
        {currentStatus === 'SERVED' && (
          <div className="glass-panel p-5 rounded-3xl border border-emerald-500/30 shadow-glow animate-fadeIn">
            <div className="text-center mb-3">
              <h3 className="text-sm font-bold text-white">How was your dining experience?</h3>
              <p className="text-[11px] text-slate-400">Your rating helps our chefs maintain excellence.</p>
            </div>

            {feedbackSubmitted ? (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
                <div className="flex justify-center space-x-1 text-amber-400 mb-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`}
                    />
                  ))}
                </div>
                <p className="text-xs font-bold text-emerald-300">Thank you for your rating!</p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className="p-1.5 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`}
                      />
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share a quick note to chef..."
                  className="w-full px-3 py-2 bg-charcoal-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />

                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm"
                >
                  <Send className="w-3 h-3" />
                  <span>Submit Rating</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* Itemized Bill Breakdown */}
        {orderDetails && orderDetails.items && (
          <div className="glass-panel p-5 rounded-3xl border border-white/5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Ordered Items ({orderDetails.items.length})
            </h3>

            <div className="divide-y divide-white/5">
              {orderDetails.items.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-white">
                      {item.quantity}× {item.name}
                    </span>
                    {item.addedByName && (
                      <span className="ml-1.5 text-[10px] text-orange-400/90 bg-orange-500/10 px-1.5 py-0.5 rounded font-mono">
                        by {item.addedByName}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-slate-300">₹{item.subtotal}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-white/10 space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono text-slate-300">
                  ₹{orderDetails.subtotalAmount || orderDetails.totalAmount - 40}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Taxes & Charges (5% GST)</span>
                <span className="font-mono text-slate-300">₹{orderDetails.taxesAndCharges || 40}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-white pt-1">
                <span>Total Amount</span>
                <span className="font-mono text-orange-400">₹{orderDetails.totalAmount}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action button */}
        <button
          onClick={onBackToMenu}
          className="w-full py-3 rounded-2xl bg-charcoal-800 hover:bg-charcoal-700 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all border border-white/10"
        >
          <Utensils className="w-3.5 h-3.5 text-orange-400" />
          <span>Add More Dishes ({(orderDetails?.tableNumber || orderSummary.tableNumber || '').startsWith('Table') ? (orderDetails?.tableNumber || orderSummary.tableNumber) : `Table ${orderDetails?.tableNumber || orderSummary.tableNumber}`})</span>
        </button>
      </main>

      {/* Split Bill Modal */}
      {showSplitBillModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-sm w-full p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                <Users className="w-4 h-4 text-orange-400" />
                <span>Split Bill Calculator</span>
              </h3>
              <button onClick={() => setShowSplitBillModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs text-slate-300 font-semibold block">Number of Guests Splitting:</label>
              <div className="flex items-center space-x-3 justify-center">
                <button
                  onClick={() => setHeadcount(Math.max(1, headcount - 1))}
                  className="w-8 h-8 rounded-xl bg-charcoal-800 text-white font-bold"
                >
                  -
                </button>
                <span className="font-mono text-xl font-bold text-orange-400">{headcount}</span>
                <button
                  onClick={() => setHeadcount(headcount + 1)}
                  className="w-8 h-8 rounded-xl bg-charcoal-800 text-white font-bold"
                >
                  +
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-charcoal-900 border border-white/5 text-center space-y-1">
                <span className="text-[11px] text-slate-400 block">Amount Per Head</span>
                <span className="text-2xl font-mono font-bold text-emerald-400">
                  ₹{Math.ceil((orderDetails?.totalAmount || 0) / headcount)}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowSplitBillModal(false)}
              className="w-full py-2.5 bg-orange-500 text-charcoal-950 font-bold text-xs rounded-xl"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* In-App Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-sm w-full p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-orange-400" />
                <span>In-App Express Payment</span>
              </h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-center p-3 rounded-2xl bg-charcoal-900 border border-white/5">
                <span className="text-xs text-slate-400 block">Total Due</span>
                <span className="text-2xl font-mono font-bold text-orange-400">₹{orderDetails?.totalAmount}</span>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-semibold block">Select Payment Method:</label>
                {(['UPI', 'CARD', 'CASH'] as const).map((method) => (
                  <button
                    key={method}
                    onClick={() => setSelectedPayMethod(method)}
                    className={`w-full p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                      selectedPayMethod === method
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500'
                        : 'bg-charcoal-900 text-slate-300 border-white/5'
                    }`}
                  >
                    <span>{method === 'UPI' ? 'Instant UPI QR (GPay / PhonePe)' : method === 'CARD' ? 'Credit / Debit Card' : 'Pay Cash to Waiter'}</span>
                    {selectedPayMethod === method && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleProcessPayment}
              disabled={paying}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-charcoal-950 font-black text-xs rounded-xl shadow-glow"
            >
              {paying ? 'Processing Payment...' : `Confirm Pay ₹${orderDetails?.totalAmount}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

