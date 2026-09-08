import React, { useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Flame, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

interface AdminLoginPageProps {
  onBackToCustomer: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onBackToCustomer }) => {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState<string>('admin@emberandplate.com');
  const [password, setPassword] = useState<string>('Admin@12345');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await login(email, password);
    if (!res.success) {
      setError(res.error || 'Invalid credentials');
    }
    setLoading(false);
  };

  const handleFillDemo = () => {
    setEmail('admin@emberandplate.com');
    setPassword('Admin@12345');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-charcoal-950 flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-orange-500 selection:text-white">
      {/* Background glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top button to go back to customer ordering */}
      <button
        onClick={onBackToCustomer}
        className="absolute top-6 left-6 px-4 py-2 rounded-xl bg-charcoal-900/80 hover:bg-charcoal-800 text-xs text-slate-300 font-semibold border border-white/10 transition-colors"
      >
        ← Customer Ordering Site
      </button>

      <div className="glass-panel max-w-md w-full p-8 rounded-3xl border border-white/10 shadow-card relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-600 flex items-center justify-center shadow-glow">
            <Flame className="w-8 h-8 text-white fill-white animate-pulse" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-amber-200 to-yellow-400">
            EMBER & PLATE
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Kitchen & Administration Portal
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@emberandplate.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-charcoal-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-charcoal-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-charcoal-950 font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-glow hover:shadow-glow-gold active:scale-98 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-charcoal-950 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Fill Pill */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <button
            type="button"
            onClick={handleFillDemo}
            className="inline-flex items-center space-x-1.5 text-[11px] text-orange-400/90 hover:text-orange-300 font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autofill Seeded Admin Credentials</span>
          </button>
        </div>
      </div>
    </div>
  );
};
