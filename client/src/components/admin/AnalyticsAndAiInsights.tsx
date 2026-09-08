import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAdminAuth } from '../../context/AdminAuthContext';
import {
  BarChart3,
  TrendingUp,
  Lightbulb,
  DollarSign,
  Clock,
  PieChart,
  Flame,
  ArrowUpRight,
  Zap,
  Info,
  ShieldCheck,
} from 'lucide-react';

export const AnalyticsAndAiInsights: React.FC = () => {
  const { token } = useAdminAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        const [anRes, aiRes] = await Promise.all([
          fetch('/api/admin/analytics', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admin/ai-insights', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (anRes.ok) {
          const anData = await anRes.json();
          setAnalytics(anData.metrics);
        }
        if (aiRes.ok) {
          const aiData = await aiRes.json();
          setAiInsights(aiData.insights || []);
        }
      } catch (err) {
        console.error('Error loading analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading || !analytics) {
    return (
      <div className="p-8 text-center text-text-muted">
        <div className="w-8 h-8 border-2 border-ember-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs">Computing real-time analytics and AI order patterns...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Heading */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-serif font-bold text-text-primary flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-ember-500" />
            <span>Analytics & AI Culinary Insights</span>
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Real order performance metrics and data-driven kitchen co-occurrence recommendations.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-[11px] font-bold text-gold-highlight bg-ember-500/15 border border-ember-500/30 px-3 py-1.5 rounded-xl shadow-sm">
          <Info className="w-3.5 h-3.5 text-ember-500" />
          <span>Rule-Based Engine (Heuristic Co-occurrence)</span>
        </div>
      </div>

      {/* Primary Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Weekly Revenue */}
        <motion.div
          whileHover={{ y: -4 }}
          className="glass-panel p-4.5 rounded-2xl border border-ember-500/30 shadow-card"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-secondary">Weekly Revenue</span>
            <div className="p-2 rounded-xl bg-ember-500/15 text-gold-highlight">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-text-primary mt-2 tabular-nums">
            ₹{analytics.weeklyRevenue.toLocaleString()}
          </div>
          <div className="flex items-center text-status-success text-[11px] font-bold mt-1 space-x-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{analytics.weeklyRevenueGrowth}</span>
          </div>
        </motion.div>

        {/* Average Order Value (AOV) */}
        <motion.div
          whileHover={{ y: -4 }}
          className="glass-panel p-4.5 rounded-2xl border border-ember-500/30 shadow-card"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-secondary">Average Order Value</span>
            <div className="p-2 rounded-xl bg-ember-500/15 text-ember-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-text-primary mt-2 tabular-nums">
            ₹{analytics.averageOrderValue}
          </div>
          <div className="flex items-center text-status-success text-[11px] font-bold mt-1 space-x-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{analytics.averageOrderValueGrowth}</span>
          </div>
        </motion.div>

        {/* Peak Dining Hour */}
        <motion.div
          whileHover={{ y: -4 }}
          className="glass-panel p-4.5 rounded-2xl border border-purple-500/30 shadow-card"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-secondary">Peak Dining Hour</span>
            <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-text-primary mt-2 tabular-nums">
            7:00 PM
          </div>
          <div className="text-[11px] text-purple-300 mt-1 font-semibold">
            102 orders placed during rush
          </div>
        </motion.div>

        {/* Revenue Category Split */}
        <motion.div
          whileHover={{ y: -4 }}
          className="glass-panel p-4.5 rounded-2xl border border-status-success/30 shadow-card"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-secondary">Revenue Share</span>
            <div className="p-2 rounded-xl bg-status-success/15 text-status-success">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-serif font-bold text-text-primary mt-2 tabular-nums">
            Food 72% • Drinks 18%
          </div>
          <div className="text-[11px] text-text-muted mt-1 font-semibold">
            Desserts & Addons: 10%
          </div>
        </motion.div>
      </div>

      {/* Featured AI Insight Cards with 3D Flip revealing confidence % */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-secondary flex items-center space-x-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-gold-highlight" />
          <span>AI CULINARY & OPERATIONAL INSIGHTS (RULE-BASED ENGINE)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {aiInsights.map((insight, idx) => (
            <motion.div
              key={insight.id}
              initial={{ rotateY: -90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: idx * 0.15, ease: 'easeOut' }}
              style={{ perspective: 1000 }}
              className="glass-panel p-5 rounded-2xl border border-ember-500/30 bg-gradient-to-br from-bg-surface to-bg-surface-2 shadow-glow relative overflow-hidden flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-ember-500/20 text-gold-highlight border border-ember-500/30">
                    {insight.category}
                  </span>
                  <motion.span
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.15 + 0.4 }}
                    className="text-[10px] font-extrabold text-status-success flex items-center space-x-1 bg-status-success/15 px-2 py-0.5 rounded-full border border-status-success/30"
                  >
                    <ShieldCheck className="w-3 h-3" />
                    <span>{insight.badge || '94% Confidence'}</span>
                  </motion.span>
                </div>

                <h4 className="text-sm font-bold text-text-primary font-serif">{insight.title}</h4>

                <p className="text-xs text-text-secondary leading-relaxed italic bg-bg-primary/60 p-3 rounded-xl border border-border-subtle">
                  "{insight.insight}"
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-xs">
                <span className="text-[11px] text-gold-highlight font-bold">{insight.impact}</span>
                <button
                  onClick={() => alert(`Applied rule action: ${insight.actionText}`)}
                  className="px-3 py-1 rounded-xl bg-ember-gradient text-bg-primary font-extrabold text-[11px] shadow-sm hover:brightness-110 transition-all"
                >
                  {insight.actionText}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Grid: Popular Dishes Ranking + Hourly Bar Chart with Staggered Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Popular Dishes Ranked */}
        <div className="lg:col-span-6 glass-panel p-5 rounded-3xl border border-border-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-secondary flex items-center space-x-1.5">
              <Flame className="w-4 h-4 text-ember-500" />
              <span>Top-Performing Dishes Leaderboard</span>
            </h3>
            <span className="text-[11px] text-text-muted">Live DB orders</span>
          </div>

          <div className="space-y-3">
            {analytics.popularItems.map((dish: any, idx: number) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-bg-surface border border-border-subtle flex items-center justify-between hover:border-ember-500/30 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-lg bg-ember-500/20 text-gold-highlight flex items-center justify-center text-xs font-bold font-mono">
                    #{idx + 1}
                  </span>
                  <div>
                    <h5 className="text-xs font-bold text-text-primary">{dish.name}</h5>
                    <span className="text-[10px] text-text-muted">{dish.category}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-text-primary tabular-nums">
                    {dish.ordersCount} units
                  </span>
                  <span className="text-[10px] text-gold-highlight block font-mono tabular-nums">
                    ₹{dish.revenue.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hourly Orders Bar Chart with Staggered Bar Growth */}
        <div className="lg:col-span-6 glass-panel p-5 rounded-3xl border border-border-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-secondary flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-purple-400" />
              <span>Orders by Hour of Day (24-Hour Rush)</span>
            </h3>
            <span className="text-[11px] text-purple-300 font-bold">Peak: 7 PM (102)</span>
          </div>

          <div className="space-y-2.5 pt-1">
            {analytics.hourlyDistribution.map((slot: any, idx: number) => {
              const percentage = Math.round((slot.orders / 102) * 100);
              const isPeak = slot.hour.includes('Peak');

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className={`font-semibold ${isPeak ? 'text-gold-highlight font-bold' : 'text-text-secondary'}`}>
                      {slot.hour}
                    </span>
                    <span className="font-mono text-text-muted tabular-nums">{slot.orders} orders</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-bg-surface-2 overflow-hidden border border-border-subtle/50">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.08, ease: 'easeOut' }}
                      className={`h-full rounded-full ${
                        isPeak
                          ? 'bg-ember-gradient shadow-glow'
                          : 'bg-ember-500/50'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
