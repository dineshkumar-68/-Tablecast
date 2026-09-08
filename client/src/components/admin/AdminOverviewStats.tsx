import React from 'react';
import { motion } from 'framer-motion';
import { AdminOverviewStats as StatsType } from '../../types';
import { DollarSign, Flame, BellRing, CheckCircle2, Users } from 'lucide-react';

interface AdminOverviewStatsProps {
  stats: StatsType | null;
  loading?: boolean;
}

export const AdminOverviewStats: React.FC<AdminOverviewStatsProps> = ({ stats, loading }) => {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="glass-panel p-5 rounded-2xl animate-pulse h-28 border border-border-subtle" />
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Today's Revenue",
      value: `₹${stats.totalRevenueToday.toLocaleString()}`,
      subtext: `${stats.totalOrdersToday} orders total`,
      icon: DollarSign,
      color: 'text-gold-highlight',
      bg: 'bg-ember-500/15',
      border: 'border-ember-500/30',
    },
    {
      title: 'In Kitchen',
      value: stats.preparingCount,
      subtext: `${stats.placedCount} new waiting`,
      icon: Flame,
      color: 'text-ember-500',
      bg: 'bg-ember-500/15',
      border: 'border-ember-500/30',
    },
    {
      title: 'Ready to Serve',
      value: stats.readyCount,
      subtext: 'Awaiting waitstaff pickup',
      icon: BellRing,
      color: 'text-[#4ADE80]',
      bg: 'bg-[#4ADE80]/15',
      border: 'border-[#4ADE80]/30',
    },
    {
      title: 'Completed',
      value: stats.servedCount,
      subtext: `${stats.cancelledCount} cancelled`,
      icon: CheckCircle2,
      color: 'text-[#5EA8E0]',
      bg: 'bg-[#5EA8E0]/15',
      border: 'border-[#5EA8E0]/30',
    },
    {
      title: 'Table Occupancy',
      value: `${stats.tablesOccupied} / ${stats.tablesTotal}`,
      subtext: `${stats.tablesAvailable} tables available`,
      icon: Users,
      color: 'text-purple-400',
      bg: 'bg-purple-500/15',
      border: 'border-purple-500/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {statCards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={idx}
            whileHover={{ y: -4, boxShadow: '0 12px 30px -5px rgba(0, 0, 0, 0.7), 0 0 15px rgba(232, 147, 90, 0.2)' }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className={`glass-panel p-4.5 rounded-2xl border ${card.border} backdrop-blur-md flex flex-col justify-between cursor-pointer`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-secondary">{card.title}</span>
              <div className={`p-2 rounded-xl ${card.bg} ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-serif font-bold text-text-primary tracking-tight tabular-nums">
                {card.value}
              </div>
              <p className="text-[11px] text-text-muted mt-0.5">{card.subtext}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
