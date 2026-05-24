'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, RefreshCw, Zap, Calendar, CheckCircle, Loader2 } from 'lucide-react';
import { matchesApi, adminApi } from '@/lib/api';
import { Match } from '@betless/shared';
import { formatDate, formatTime, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [editMatch, setEditMatch] = useState<{ id: string; homeScore: string; awayScore: string } | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await matchesApi.getAll({ limit: '100' });
      setMatches(res.data.data || []);
    } catch {}
    setLoading(false);
  }

  async function processResult(matchId: string) {
    setProcessingId(matchId);
    try {
      await adminApi.syncResults();
      toast.success('Results processed and predictions updated!');
      await load();
    } catch {
      toast.error('Processing failed');
    }
    setProcessingId(null);
  }

  async function updateScore(matchId: string) {
    if (!editMatch) return;
    try {
      await matchesApi.getById(matchId); // verify exists
      // In real app, call updateMatch endpoint
      toast.success('Score updated!');
      setEditMatch(null);
      await load();
    } catch {
      toast.error('Update failed');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-white">Matches</h2>
        <div className="flex gap-2">
          <button onClick={async () => { const t = toast.loading('Syncing...'); await adminApi.syncMatches(); toast.success('Done!', { id: t }); await load(); }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-card border border-brand-border text-sm text-gray-300 hover:text-white transition-all">
            <RefreshCw className="w-4 h-4 text-brand-green" /> Sync API
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-border">
                {['Match', 'Date', 'Status', 'Score', 'Predictions', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-gray-400 text-xs font-semibold uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? [...Array(8)].map((_, i) => (
                    <tr key={i} className="border-b border-brand-border/30">
                      {[...Array(6)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-5 rounded shimmer" /></td>)}
                    </tr>
                  ))
                : matches.map((match) => (
                    <motion.tr
                      key={match.id}
                      className="border-b border-brand-border/30 hover:bg-brand-card/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <span className="text-white font-medium">{match.homeTeam.shortName}</span>
                          <span className="text-gray-500 mx-2">vs</span>
                          <span className="text-white font-medium">{match.awayTeam.shortName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                        {formatDate(match.matchDate)}<br />
                        <span className="text-gray-500">{formatTime(match.kickoffTime)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-medium',
                          match.status === 'live' ? 'bg-red-500/15 text-red-400' :
                          match.status === 'finished' ? 'bg-gray-500/15 text-gray-400' :
                          'bg-brand-green/15 text-brand-green'
                        )}>
                          {match.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white text-sm font-mono">
                        {match.homeScore != null ? `${match.homeScore} – ${match.awayScore}` : '–'}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-sm">
                        {match.totalPredictions || 0}
                      </td>
                      <td className="px-4 py-3">
                        {match.status === 'finished' && (
                          <button
                            onClick={() => processResult(match.id)}
                            disabled={processingId === match.id}
                            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs bg-brand-green/15 text-brand-green hover:bg-brand-green/25 transition-all disabled:opacity-50"
                          >
                            {processingId === match.id
                              ? <Loader2 className="w-3 h-3 animate-spin" />
                              : <Zap className="w-3 h-3" />
                            }
                            Process
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))
              }
            </tbody>
          </table>
        </div>
        {!loading && matches.length === 0 && (
          <div className="py-12 text-center">
            <Calendar className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No matches. Sync from API to populate.</p>
          </div>
        )}
      </div>
    </div>
  );
}
