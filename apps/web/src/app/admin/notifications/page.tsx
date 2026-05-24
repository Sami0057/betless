'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Bell, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminNotificationsPage() {
  const [form, setForm] = useState({ title: '', titleAr: '', message: '', messageAr: '', type: 'announcement' });
  const [sending, setSending] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      await adminApi.broadcast(form);
      toast.success(`Notification sent to all users!`);
      setForm({ title: '', titleAr: '', message: '', messageAr: '', type: 'announcement' });
    } catch {
      toast.error('Failed to send notification');
    }
    setSending(false);
  }

  const TYPES = [
    { value: 'announcement', label: 'Announcement', icon: '📣' },
    { value: 'match_starting', label: 'Match Starting', icon: '⚽' },
    { value: 'streak_milestone', label: 'Streak Milestone', icon: '🔥' },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-black text-white">Broadcast Notification</h2>
      <p className="text-gray-400 text-sm">Send a push notification to all active users on the platform.</p>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <form onSubmit={handleSend} className="space-y-5">
          {/* Type */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Notification Type</label>
            <div className="flex gap-2 flex-wrap">
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm({ ...form, type: t.value })}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                    form.type === t.value
                      ? 'border-brand-green bg-brand-green/15 text-brand-green'
                      : 'border-brand-border text-gray-400 hover:text-white'
                  }`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Titles */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Title (English)</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                placeholder="Notification title..."
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Title (Arabic)</label>
              <input
                value={form.titleAr}
                onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
                placeholder="عنوان الإشعار..."
                dir="rtl"
                className="input-field"
              />
            </div>
          </div>

          {/* Messages */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Message (English)</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
                rows={4}
                placeholder="Notification message..."
                className="input-field resize-none"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Message (Arabic)</label>
              <textarea
                value={form.messageAr}
                onChange={(e) => setForm({ ...form, messageAr: e.target.value })}
                rows={4}
                placeholder="نص الإشعار..."
                dir="rtl"
                className="input-field resize-none"
              />
            </div>
          </div>

          {/* Warning */}
          <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-yellow-400 text-sm flex items-center gap-2">
              <Bell className="w-4 h-4 shrink-0" />
              This notification will be sent to ALL registered users. Use with caution.
            </p>
          </div>

          <button
            type="submit"
            disabled={sending}
            className="btn-primary flex items-center gap-2"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {sending ? 'Sending...' : 'Send to All Users'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
