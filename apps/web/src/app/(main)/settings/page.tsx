'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Globe, Bell, Shield, LogOut, Loader2, Save } from 'lucide-react';
import { usersApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, updateUser } = useAuthStore();
  const [form, setForm] = useState({ username: '', language: 'en', avatarUrl: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (user) setForm({ username: user.username, language: user.language, avatarUrl: user.avatarUrl || '' });
  }, [user, isAuthenticated, router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await usersApi.updateProfile(form);
      updateUser(res.data.data);
      toast.success('Profile updated!');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || 'Update failed');
    }
    setSaving(false);
  }

  async function handleLogout() {
    await logout();
    router.push('/');
    toast.success('Signed out');
  }

  const SECTIONS = [
    {
      id: 'profile',
      icon: User,
      label: 'Profile',
      content: (
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="input-field"
              minLength={3}
              maxLength={30}
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Avatar URL</label>
            <input
              type="url"
              value={form.avatarUrl}
              onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
              placeholder="https://..."
              className="input-field"
            />
          </div>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </form>
      ),
    },
    {
      id: 'language',
      icon: Globe,
      label: 'Language',
      content: (
        <div className="space-y-3">
          {[{ value: 'en', label: 'English' }, { value: 'ar', label: 'العربية' }].map((lang) => (
            <button
              key={lang.value}
              onClick={() => setForm({ ...form, language: lang.value })}
              className={cn(
                'w-full text-left px-4 py-3 rounded-xl border font-medium transition-all',
                form.language === lang.value
                  ? 'border-brand-green bg-brand-green/10 text-brand-green'
                  : 'border-brand-border text-gray-400 hover:border-brand-green/30'
              )}
            >
              {lang.label}
            </button>
          ))}
        </div>
      ),
    },
    {
      id: 'notifications',
      icon: Bell,
      label: 'Notifications',
      content: (
        <div className="space-y-4">
          {[
            'Match starting reminders',
            'Prediction results',
            'Rank upgrades',
            'Badge unlocks',
            'Weekly digest',
          ].map((notif) => (
            <div key={notif} className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">{notif}</span>
              <button className="w-12 h-6 rounded-full bg-brand-green relative transition-all">
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white shadow" />
              </button>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'account',
      icon: Shield,
      label: 'Account',
      content: (
        <div className="space-y-4">
          <div className="glass-card p-4 border-brand-border">
            <p className="text-gray-400 text-sm mb-1">Email</p>
            <p className="text-white font-medium">{user?.email}</p>
          </div>
          <div className="glass-card p-4 border-brand-border">
            <p className="text-gray-400 text-sm mb-1">Account Status</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-green" />
              <span className="text-brand-green font-medium text-sm">Active</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all font-medium"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      ),
    },
  ];

  const [activeSection, setActiveSection] = useState('profile');

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-black text-white mb-8">Settings</h1>

      <div className="grid md:grid-cols-[200px_1fr] gap-6">
        {/* Sidebar */}
        <nav className="space-y-1">
          {SECTIONS.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left',
                activeSection === id
                  ? 'bg-brand-green/15 text-brand-green border border-brand-green/20'
                  : 'text-gray-400 hover:text-white hover:bg-brand-card'
              )}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6"
        >
          <h2 className="text-lg font-black text-white mb-6">
            {SECTIONS.find((s) => s.id === activeSection)?.label}
          </h2>
          {SECTIONS.find((s) => s.id === activeSection)?.content}
        </motion.div>
      </div>
    </div>
  );
}
