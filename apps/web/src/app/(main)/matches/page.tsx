'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { matchesApi } from '@/lib/api';
import { Match } from '@betless/shared';
import MatchCard from '@/components/ui/MatchCard';
import { formatDate, cn } from '@/lib/utils';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'scheduled', label: 'Upcoming' },
  { key: 'live', label: 'Live' },
  { key: 'finished', label: 'Results' },
];

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');

  const loadMatches = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (activeTab !== 'all') params.status = activeTab;
      if (selectedDate && activeTab !== 'all') params.date = selectedDate;

      const res = await matchesApi.getAll(params);
      setMatches(res.data.data || []);
    } catch {
      setMatches([]);
    }
    setLoading(false);
  }, [activeTab, selectedDate]);

  useEffect(() => { loadMatches(); }, [loadMatches]);

  // Date navigation
  function offsetDate(days: number) {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  }

  // 7-day date tabs
  const dateTabs = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 3 + i);
    return d.toISOString().split('T')[0];
  });

  const filtered = matches.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return m.homeTeam.name.toLowerCase().includes(q) || m.awayTeam.name.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">Matches</h1>
        <p className="text-gray-400">Saudi Pro League — Predict match outcomes and earn points</p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all',
              activeTab === tab.key
                ? 'bg-brand-green text-black font-bold'
                : 'bg-brand-card border border-brand-border text-gray-400 hover:text-white'
            )}
          >
            {tab.label}
            {tab.key === 'live' && <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-red-400 inline-block animate-pulse" />}
          </button>
        ))}
      </div>

      {/* Date navigation */}
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => offsetDate(-1)} className="p-2 rounded-xl bg-brand-card border border-brand-border hover:border-brand-green/30 transition-all">
          <ChevronLeft className="w-4 h-4 text-gray-400" />
        </button>
        <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1">
          {dateTabs.map((date) => {
            const d = new Date(date);
            const isToday = date === new Date().toISOString().split('T')[0];
            const isSelected = date === selectedDate;
            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={cn(
                  'flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-all text-center min-w-[60px]',
                  isSelected
                    ? 'bg-brand-green text-black font-bold'
                    : 'bg-brand-card border border-brand-border text-gray-400 hover:text-white'
                )}
              >
                <div>{isToday ? 'Today' : d.toLocaleDateString('en', { weekday: 'short' })}</div>
                <div className="font-black">{d.getDate()}</div>
              </button>
            );
          })}
        </div>
        <button onClick={() => offsetDate(1)} className="p-2 rounded-xl bg-brand-card border border-brand-border hover:border-brand-green/30 transition-all">
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search teams..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Match list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="glass-card h-48 shimmer" />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((match, i) => (
            <motion.div key={match.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <MatchCard match={match} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-16 text-center">
          <Calendar className="w-14 h-14 text-gray-600 mx-auto mb-4" />
          <p className="text-white font-semibold text-lg">No matches found</p>
          <p className="text-gray-500 text-sm mt-2">
            {search ? 'Try a different search term' : 'No matches for this date/filter'}
          </p>
        </div>
      )}
    </div>
  );
}
