'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bell, Check, CheckCheck, Target, Trophy, Star, Zap, Megaphone } from 'lucide-react';
import { usersApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Notification } from '@betless/shared';
import { formatRelative, cn } from '@/lib/utils';

const NOTIF_ICONS: Record<string, React.ReactNode> = {
  prediction_result: <Target className="w-5 h-5 text-brand-green" />,
  rank_upgrade: <Trophy className="w-5 h-5 text-brand-gold" />,
  badge_earned: <Star className="w-5 h-5 text-purple-400" />,
  match_starting: <Zap className="w-5 h-5 text-blue-400" />,
  announcement: <Megaphone className="w-5 h-5 text-orange-400" />,
  streak_milestone: <Bell className="w-5 h-5 text-brand-green" />,
};

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    async function load() {
      try {
        const res = await usersApi.getNotifications();
        setNotifications(res.data.data || []);
      } catch {}
      setLoading(false);
    }
    load();
  }, [isAuthenticated, router]);

  async function markAllRead() {
    await usersApi.markNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  async function markRead(id: string) {
    await usersApi.markNotificationsRead(id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-brand-green text-sm mt-1">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="glass-card h-20 shimmer" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Bell className="w-14 h-14 text-gray-600 mx-auto mb-4" />
          <p className="text-white font-semibold text-lg">All caught up!</p>
          <p className="text-gray-500 text-sm mt-2">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif, i) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => !notif.isRead && markRead(notif.id)}
              className={cn(
                'flex items-start gap-4 px-4 py-4 rounded-xl border transition-all cursor-pointer',
                notif.isRead
                  ? 'border-brand-border/30 bg-brand-card/30'
                  : 'border-brand-green/20 bg-brand-green/5 hover:bg-brand-green/8'
              )}
            >
              <div className="w-10 h-10 rounded-xl bg-brand-dark flex items-center justify-center shrink-0 border border-brand-border">
                {NOTIF_ICONS[notif.type] || <Bell className="w-5 h-5 text-gray-400" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={cn('font-semibold text-sm', notif.isRead ? 'text-gray-300' : 'text-white')}>
                    {notif.title}
                  </p>
                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-brand-green shrink-0 mt-1.5" />
                  )}
                </div>
                <p className="text-gray-500 text-xs mt-1 leading-relaxed">{notif.message}</p>
                <p className="text-gray-600 text-xs mt-2">{formatRelative(notif.createdAt)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
