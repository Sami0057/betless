'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Megaphone, Send, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState<{ id: string; title: string; content: string; created_at: string; is_active: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [form, setForm] = useState({ title: '', titleAr: '', content: '', contentAr: '', priority: '0' });
  const [broadcast, setBroadcast] = useState({ title: '', titleAr: '', message: '', messageAr: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const res = await adminApi.getAnnouncements();
      setItems(res.data.data || []);
    } catch {}
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminApi.createAnnouncement({ ...form, priority: parseInt(form.priority) });
      toast.success('Announcement created');
      setForm({ title: '', titleAr: '', content: '', contentAr: '', priority: '0' });
      setShowForm(false);
      await load();
    } catch {
      toast.error('Failed');
    }
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    try {
      await adminApi.deleteAnnouncement(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success('Deleted');
    } catch {
      toast.error('Failed');
    }
  }

  async function handleBroadcast(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminApi.broadcast(broadcast);
      toast.success('Notification sent to all users!');
      setBroadcastOpen(false);
      setBroadcast({ title: '', titleAr: '', message: '', messageAr: '' });
    } catch {
      toast.error('Failed');
    }
    setSubmitting(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-white">Announcements</h2>
        <div className="flex gap-2">
          <button onClick={() => setBroadcastOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-gold/15 border border-brand-gold/30 text-brand-gold text-sm hover:bg-brand-gold/20 transition-all">
            <Send className="w-4 h-4" /> Broadcast Notification
          </button>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-green/15 border border-brand-green/30 text-brand-green text-sm hover:bg-brand-green/20 transition-all">
            <Plus className="w-4 h-4" /> New Announcement
          </button>
        </div>
      </div>

      {/* Create form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-4">New Announcement</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm mb-1">Title (EN)</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="input-field" />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Title (AR)</label>
                <input value={form.titleAr} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} dir="rtl" className="input-field" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-300 text-sm mb-1">Content (EN)</label>
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required rows={3} className="input-field resize-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-300 text-sm mb-1">Content (AR)</label>
                <textarea value={form.contentAr} onChange={(e) => setForm({ ...form, contentAr: e.target.value })} rows={3} dir="rtl" className="input-field resize-none" />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Priority (0-10)</label>
                <input type="number" min="0" max="10" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="input-field" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Broadcast form */}
      {broadcastOpen && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border-brand-gold/20">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Send className="w-5 h-5 text-brand-gold" /> Broadcast to All Users</h3>
          <form onSubmit={handleBroadcast} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm mb-1">Title (EN)</label>
                <input value={broadcast.title} onChange={(e) => setBroadcast({ ...broadcast, title: e.target.value })} required className="input-field" />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Title (AR)</label>
                <input value={broadcast.titleAr} onChange={(e) => setBroadcast({ ...broadcast, titleAr: e.target.value })} dir="rtl" className="input-field" />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Message (EN)</label>
                <textarea value={broadcast.message} onChange={(e) => setBroadcast({ ...broadcast, message: e.target.value })} required rows={3} className="input-field resize-none" />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Message (AR)</label>
                <textarea value={broadcast.messageAr} onChange={(e) => setBroadcast({ ...broadcast, messageAr: e.target.value })} rows={3} dir="rtl" className="input-field resize-none" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="btn-gold flex items-center gap-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send to All
              </button>
              <button type="button" onClick={() => setBroadcastOpen(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="glass-card h-24 shimmer" />)}</div>
      ) : items.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Megaphone className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No announcements yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <motion.div key={item.id} className="glass-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-white font-semibold">{item.title}</p>
                  <p className="text-gray-400 text-sm mt-1 leading-relaxed">{item.content}</p>
                  <p className="text-gray-600 text-xs mt-2">{formatDate(item.created_at)}</p>
                </div>
                <button onClick={() => handleDelete(item.id)} className="p-2 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
