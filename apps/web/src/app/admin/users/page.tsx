'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Ban, CheckCircle, User, Shield, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { formatDate, getRankColor, cn } from '@/lib/utils';
import { RankTitle } from '@betless/shared';
import toast from 'react-hot-toast';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  rank_title: RankTitle;
  total_points: number;
  correct_predictions: number;
  is_banned: boolean;
  is_verified: boolean;
  created_at: string;
  last_login?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [actionId, setActionId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (filter === 'banned') params.banned = 'true';
      if (filter === 'admin') params.role = 'admin';

      const res = await adminApi.getUsers(params);
      setUsers(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch {}
    setLoading(false);
  }, [search, filter]);

  useEffect(() => {
    const timer = setTimeout(() => loadUsers(), 300);
    return () => clearTimeout(timer);
  }, [loadUsers]);

  async function toggleBan(user: AdminUser) {
    setActionId(user.id);
    try {
      if (user.is_banned) {
        await adminApi.unbanUser(user.id);
        toast.success(`${user.username} unbanned`);
      } else {
        await adminApi.banUser(user.id, 'Violation of terms');
        toast.success(`${user.username} banned`);
      }
      await loadUsers();
    } catch {
      toast.error('Action failed');
    }
    setActionId(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <h2 className="text-xl font-black text-white">Users ({total.toLocaleString()})</h2>

        {/* Filters */}
        <div className="flex gap-2">
          {['all', 'banned', 'admin'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize',
                filter === f
                  ? 'bg-brand-green text-black'
                  : 'bg-brand-card border border-brand-border text-gray-400 hover:text-white'
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search by username or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-border">
                {['User', 'Role', 'Points', 'Correct', 'Joined', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-gray-400 text-xs font-semibold uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="border-b border-brand-border/30">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-5 rounded-lg shimmer" /></td>
                    ))}
                  </tr>
                ))
              ) : users.map((user, i) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-brand-border/30 hover:bg-brand-card/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-black"
                        style={{ backgroundColor: getRankColor(user.rank_title) }}
                      >
                        {user.username.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{user.username}</p>
                        <p className="text-gray-500 text-xs">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      user.role === 'admin' ? 'bg-brand-gold/15 text-brand-gold' :
                      user.role === 'moderator' ? 'bg-purple-400/15 text-purple-400' :
                      'bg-brand-card text-gray-400'
                    )}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-brand-green font-semibold text-sm">{user.total_points.toLocaleString()}</td>
                  <td className="px-4 py-3 text-white text-sm">{user.correct_predictions}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(user.created_at)}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      user.is_banned ? 'bg-red-500/15 text-red-400' : 'bg-brand-green/15 text-brand-green'
                    )}>
                      {user.is_banned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleBan(user)}
                      disabled={actionId === user.id || user.role === 'admin'}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                        user.is_banned
                          ? 'bg-brand-green/15 text-brand-green hover:bg-brand-green/25'
                          : 'bg-red-500/15 text-red-400 hover:bg-red-500/25',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                      )}
                    >
                      {actionId === user.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : user.is_banned ? (
                        <><CheckCircle className="w-3 h-3" /> Unban</>
                      ) : (
                        <><Ban className="w-3 h-3" /> Ban</>
                      )}
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && users.length === 0 && (
          <div className="py-12 text-center">
            <User className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
}
