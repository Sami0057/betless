'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Target, Trophy, Calendar, RefreshCw, Activity,
  TrendingUp, Zap, UserCheck, Shield, Bell,
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart,
} from 'recharts';
import { formatDate, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Analytics {
  total_users: string;
  dau: string;
  total_predictions: string;
  matches_finished: string;
  badges_awarded: string;
  userGrowth: { date: string; new_users: string }[];
  topTeams: { name: string; logo: string; match_count: string }[];
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await adminApi.getAnalytics();
        setAnalytics(res.data.data);
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  async function syncMatches() {
    const t = toast.loading('Syncing matches...');
    try {
      await adminApi.syncMatches();
      toast.success('Matches synced!', { id: t });
    } catch {
      toast.error('Sync failed', { id: t });
    }
  }

  async function syncResults() {
    const t = toast.loading('Syncing results...');
    try {
      await adminApi.syncResults();
      toast.success('Results synced!', { id: t });
    } catch {
      toast.error('Sync failed', { id: t });
    }
  }

  const stats = analytics ? [
    { label: 'Total Users', value: parseInt(analytics.total_users).toLocaleString(), icon: <Users className="w-5 h-5 text-brand-green" />, accent: 'green' as const },
    { label: 'Daily Active', value: parseInt(analytics.dau).toLocaleString(), icon: <Activity className="w-5 h-5 text-blue-400" />, accent: 'default' as const },
    { label: 'Total Predictions', value: parseInt(analytics.total_predictions).toLocaleString(), icon: <Target className="w-5 h-5 text-brand-gold" />, accent: 'gold' as const },
    { label: 'Finished Matches', value: parseInt(analytics.matches_finished).toLocaleString(), icon: <Calendar className="w-5 h-5 text-purple-400" />, accent: 'default' as const },
    { label: 'Badges Awarded', value: parseInt(analytics.badges_awarded).toLocaleString(), icon: <Trophy className="w-5 h-5 text-orange-400" />, accent: 'default' as const },
  ] : [];

  const chartData = analytics?.userGrowth.map((d) => ({
    date: formatDate(d.date),
    users: parseInt(d.new_users),
  })) || [];

  return (
    <div className="space-y-8">
      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={syncMatches} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-card border border-brand-border text-sm text-gray-300 hover:text-white hover:border-brand-green/30 transition-all">
          <RefreshCw className="w-4 h-4 text-brand-green" /> Sync Matches
        </button>
        <button onClick={syncResults} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-card border border-brand-border text-sm text-gray-300 hover:text-white hover:border-brand-green/30 transition-all">
          <Zap className="w-4 h-4 text-brand-gold" /> Sync Results
        </button>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="glass-card h-24 shimmer" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                'glass-card p-4',
                stat.accent === 'green' && 'border-brand-green/20 bg-brand-green/5',
                stat.accent === 'gold' && 'border-brand-gold/20 bg-brand-gold/5',
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-xs uppercase tracking-wide">{stat.label}</p>
                {stat.icon}
              </div>
              <p className="text-2xl font-black text-white">{stat.value}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* User growth chart */}
      {chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-brand-green" />
            <h2 className="text-lg font-black text-white">User Growth (30 days)</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00E676" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00E676" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" />
              <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 11 }} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#16161F', border: '1px solid #1E1E2E', borderRadius: '12px', color: '#fff' }}
              />
              <Area type="monotone" dataKey="users" stroke="#00E676" strokeWidth={2} fill="url(#greenGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Top teams */}
      {analytics?.topTeams && analytics.topTeams.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6"
        >
          <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-brand-gold" /> Top Teams by Fixture Count
          </h2>
          <div className="space-y-3">
            {analytics.topTeams.map((team, i) => (
              <div key={team.name} className="flex items-center gap-3">
                <span className="text-gray-500 text-sm w-6">{i + 1}.</span>
                <span className="text-white font-medium text-sm flex-1">{team.name}</span>
                <span className="text-brand-green font-bold">{team.match_count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
