import React, { useState } from 'react';
import { TableInfo, RestaurantInfo, CustomerSession } from '../types';
import { ClocheLogo } from './ClocheLogo';
import { 
  Users, 
  Phone, 
  User, 
  Utensils, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  Flame
} from 'lucide-react';

interface CustomerLoginDashboardProps {
  tableInfo: TableInfo;
  restaurantInfo: RestaurantInfo;
  existingSession?: CustomerSession | null;
  onLoginSuccess: (session: CustomerSession) => void;
  onSwitchToAdmin?: () => void;
}

export const CustomerLoginDashboard: React.FC<CustomerLoginDashboardProps> = ({
  tableInfo,
  restaurantInfo,
  existingSession,
  onLoginSuccess,
  onSwitchToAdmin,
}) => {
  const [name, setName] = useState<string>(existingSession?.name || '');
  const [mobile, setMobile] = useState<string>(existingSession?.mobile || '');
  const [partySize, setPartySize] = useState<number>(existingSession?.partySize || 2);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Quick preset party sizes based on table capacity
  const maxParty = Math.max(1, tableInfo.capacity || 6);
  const partyOptions = Array.from({ length: Math.min(maxParty, 8) }, (_, i) => i + 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name to proceed.');
      return;
    }
    if (!mobile.trim() || mobile.trim().length < 7) {
      setError('Please enter a valid mobile number.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/tables/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrToken: tableInfo.qrToken,
          name: name.trim(),
          mobile: mobile.trim(),
          partySize,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize table login session.');
      }

      // Save token & session to local storage
      const session: CustomerSession = {
        ...data.session,
        qrToken: tableInfo.qrToken,
      };

      localStorage.setItem(`customerSession_${tableInfo.qrToken}`, JSON.stringify(session));
      localStorage.setItem('activeCustomerSessionToken', session.token);

      onLoginSuccess(session);
    } catch (err) {
      console.error('Table Login Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during check-in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueExisting = () => {
    if (existingSession) {
      onLoginSuccess(existingSession);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Background Decorative Gradients & Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-orange-700/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar Navigation */}
      <header className="px-6 py-5 border-b border-stone-800/60 bg-stone-950/70 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl shadow-lg shadow-amber-900/30">
            <ClocheLogo className="w-6 h-6 text-stone-950" />
          </div>
          <div>
            <h1 className="font-serif tracking-wide text-lg text-amber-100 font-semibold leading-tight">
              {restaurantInfo.name || 'EMBER & PLATE'}
            </h1>
            <p className="text-xs text-amber-500/80 font-medium tracking-wider uppercase">
              Digital Table Portal
            </p>
          </div>
        </div>

        {onSwitchToAdmin && (
          <button
            onClick={onSwitchToAdmin}
            className="text-xs text-stone-400 hover:text-amber-400 px-3 py-1.5 rounded-lg border border-stone-800 hover:border-amber-500/40 bg-stone-900/80 transition"
          >
            Staff Portal ➔
          </button>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-md mx-auto w-full px-5 py-8 flex flex-col justify-center relative z-10">
        
        {/* Table Welcome Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-widest mb-4 shadow-inner">
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Table Scanned Successfully</span>
          </div>

          <h2 className="text-4xl font-serif font-bold text-stone-100 mb-2">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400">Table #{tableInfo.tableNumber}</span>
          </h2>
          <p className="text-stone-400 text-sm max-w-xs mx-auto">
            Please check-in below to view our woodfire menu, customize dishes, and place your order.
          </p>
        </div>

        {/* Restore Previous Session Banner if Available */}
        {existingSession && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 backdrop-blur-sm text-left relative overflow-hidden group">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold">
                  {existingSession.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-stone-100">
                    Welcome back, {existingSession.name}!
                  </h4>
                  <p className="text-xs text-stone-400">
                    Active Session at Table #{existingSession.tableNumber} ({existingSession.partySize} Guests)
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleContinueExisting}
              className="mt-3 w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
            >
              <span>Continue Ordering as {existingSession.name}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Customer Login Card */}
        <div className="bg-stone-900/90 border border-stone-800/80 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl relative">
          
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-stone-800/80">
            <div className="flex items-center space-x-2 text-stone-200">
              <User className="w-5 h-5 text-amber-400" />
              <span className="font-semibold text-sm">Guest Details</span>
            </div>
            <span className="text-xs text-stone-400 flex items-center gap-1 bg-stone-800/60 px-2.5 py-1 rounded-full border border-stone-700/50">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Instant Dine-In Access
            </span>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Customer Name */}
            <div>
              <label className="block text-xs font-medium text-stone-300 uppercase tracking-wider mb-2">
                Your Full Name <span className="text-amber-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-stone-950/80 border border-stone-700/80 focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 text-stone-100 text-sm rounded-xl pl-10 pr-4 py-3 placeholder-stone-500 transition outline-none"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-medium text-stone-300 uppercase tracking-wider mb-2">
                Mobile Number <span className="text-amber-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full bg-stone-950/80 border border-stone-700/80 focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 text-stone-100 text-sm rounded-xl pl-10 pr-4 py-3 placeholder-stone-500 transition outline-none"
                />
              </div>
              <p className="text-[11px] text-stone-500 mt-1">Used for order notifications and bill receipts.</p>
            </div>

            {/* Party Size Counter */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-medium text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span>Number of Guests</span>
                </label>
                <span className="text-xs text-amber-400 font-bold">
                  {partySize} {partySize === 1 ? 'Guest' : 'Guests'}
                </span>
              </div>
              
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {partyOptions.map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPartySize(num)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition ${
                      partySize === num
                        ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-stone-950 border-amber-400 shadow-md shadow-amber-900/30 scale-105'
                        : 'bg-stone-950/60 border-stone-800 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold text-sm tracking-wide shadow-xl shadow-amber-900/40 hover:shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mt-4"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                  <span>Connecting to Table #{tableInfo.tableNumber}...</span>
                </>
              ) : (
                <>
                  <Utensils className="w-4 h-4" />
                  <span>Start Dining & View Menu</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* Guarantee Badges */}
          <div className="mt-6 pt-4 border-t border-stone-800/80 flex items-center justify-around text-center text-[11px] text-stone-400">
            <div className="flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
              <span>Contactless Ordering</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Real-Time Kitchen Sync</span>
            </div>
          </div>
        </div>

      </main>

      {/* Footer Branding */}
      <footer className="px-6 py-4 border-t border-stone-900 text-center text-xs text-stone-400 relative z-10">
        <p>© {new Date().getFullYear()} {restaurantInfo.name || 'EMBER & PLATE'}. All rights reserved.</p>
      </footer>
    </div>
  );
};
