import React from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { AdminLoginPage } from './AdminLoginPage';
import { AdminLayout } from './AdminLayout';
import { Flame } from 'lucide-react';

interface AdminAppProps {
  onSwitchToCustomer?: () => void;
}

export const AdminApp: React.FC<AdminAppProps> = ({ onSwitchToCustomer }) => {
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-charcoal-950 flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center animate-bounce shadow-glow">
          <Flame className="w-6 h-6 text-white" />
        </div>
        <p className="text-xs font-semibold text-slate-300 animate-pulse">
          Verifying Tablecast Admin Session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLoginPage onBackToCustomer={onSwitchToCustomer || (() => {})} />;
  }

  return <AdminLayout onGoToCustomerSite={onSwitchToCustomer || (() => {})} />;
};
