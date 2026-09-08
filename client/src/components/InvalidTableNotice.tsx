import React from 'react';
import { QrCode, AlertCircle, Sparkles, ArrowRight, LayoutDashboard } from 'lucide-react';

interface InvalidTableNoticeProps {
  errorMessage?: string;
  onSwitchToAdmin?: () => void;
}

export const InvalidTableNotice: React.FC<InvalidTableNoticeProps> = ({
  errorMessage,
  onSwitchToAdmin,
}) => {
  // Demo helper links for quick testing of seeded tables
  const demoTables = [
    { label: 'Table 05', token: 'tbl_05_tok_38a9d1', isDemo: true },
    { label: 'Table 01', token: 'tbl_01_tok_84f9a1', isDemo: false },
    { label: 'Table 02', token: 'tbl_02_tok_93e7b2', isDemo: false },
    { label: 'Table 03', token: 'tbl_03_tok_12c4d5', isDemo: false },
  ];

  return (
    <div className="min-h-screen bg-charcoal-950 flex items-center justify-center p-4 selection:bg-orange-500 selection:text-white">
      <div className="glass-panel max-w-md w-full p-8 rounded-3xl text-center border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* QR Scanner Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-b from-orange-500/20 to-amber-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-glow">
          <QrCode className="w-10 h-10 animate-pulse" />
        </div>

        <h1 className="text-xl sm:text-2xl font-serif font-bold text-white mb-2">
          Table QR Required
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
          Please scan the QR code placed on your restaurant table to view the menu and place your order.
        </p>

        {errorMessage && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center justify-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Demo Fast Switcher for Testing */}
        <div className="pt-5 border-t border-orange-500/20 space-y-3">
          <div className="flex items-center justify-center space-x-1.5 text-xs font-semibold text-orange-300 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span>Developer / Reviewer Quick Access</span>
          </div>

          <div className="flex flex-col gap-2">
            {demoTables.map((t) => (
              <a
                key={t.token}
                href={`/order?table=${t.token}`}
                className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-white/5 bg-charcoal-800 hover:bg-orange-500/20 hover:border-orange-500/40 text-slate-200 text-xs font-semibold transition-all duration-200 group"
              >
                <span className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400 group-hover:bg-orange-400 transition-colors"></span>
                  <span>Simulate {t.label} QR Scan</span>
                  {t.isDemo && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded">
                      Demo
                    </span>
                  )}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-orange-400 transform group-hover:translate-x-1 transition-transform" />
              </a>
            ))}
          </div>

          {/* Direct Staff Portal Link */}
          <div className="pt-1">
            <a
              href="/admin"
              onClick={(e) => {
                if (onSwitchToAdmin) {
                  e.preventDefault();
                  onSwitchToAdmin();
                }
              }}
              className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-orange-300 hover:text-orange-200 text-xs font-semibold border border-orange-500/30 hover:border-orange-500/50 transition-all duration-200 group"
            >
              <span className="flex items-center space-x-2">
                <LayoutDashboard className="w-4 h-4 text-orange-400" />
                <span>Go to Kitchen & Staff Dashboard (/admin)</span>
              </span>
              <ArrowRight className="w-4 h-4 text-orange-400/70 group-hover:text-orange-400 transform group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
