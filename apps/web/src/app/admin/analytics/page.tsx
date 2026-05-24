'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { formatDate } from '@/lib/utils';

const COLORS = ['#00E676', '#FFD700', '#3B82F6', '#8B5CF6', '#F97316'];

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<{
    userGrowth: { date: string; new_users: string }[];
    topTeams: { name: string; match_count: string }[];
  } | null>(null);

  useEffect(() => {
    adminApi.getAnalytics().then((res) => setData(res.data.data));
  }, []);

  const growthChart = data?.userGrowth.map((d) => ({ date: formatDate(d.date), users: parseInt(d.new_users) })) || [];
  const teamsChart = data?.topTeams.map((t) => ({ name: t.name, value: parseInt(t.match_count) })) || [];

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-black text-white">Analytics</h2>

      {/* User growth */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold text-white mb-6">Daily New Users (Last 30 Days)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={growthChart}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" />
            <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 10 }} />
            <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#16161F', border: '1px solid #1E1E2E', borderRadius: '12px', color: '#fff' }} />
            <Bar dataKey="users" fill="#00E676" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top teams */}
      {teamsChart.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-6">Top Teams by Activity</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={teamsChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {teamsChart.map((_entry, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend formatter={(value) => <span style={{ color: '#9CA3AF', fontSize: '12px' }}>{value}</span>} />
              <Tooltip contentStyle={{ background: '#16161F', border: '1px solid #1E1E2E', borderRadius: '12px', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
