'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, Users, MessageCircle, Send, Loader2 } from 'lucide-react';
import { matchesApi, commentsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import MatchCard from '@/components/ui/MatchCard';
import { formatRelative, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuthStore();
  const [match, setMatch] = useState<any>(null);
  const [userPrediction, setUserPrediction] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [matchRes, commentsRes] = await Promise.all([
          isAuthenticated ? matchesApi.getWithPrediction(id) : matchesApi.getById(id),
          commentsApi.getByMatch(id),
        ]);

        if (isAuthenticated) {
          setMatch(matchRes.data.data.match);
          setUserPrediction(matchRes.data.data.userPrediction?.prediction || null);
        } else {
          setMatch(matchRes.data.data);
        }
        setComments(commentsRes.data.data || []);
      } catch {}
      setLoading(false);
    }
    load();
  }, [id, isAuthenticated]);

  async function postComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim() || !isAuthenticated) return;
    setPosting(true);
    try {
      const res = await commentsApi.create(id, comment.trim());
      setComments((prev) => [{ ...res.data.data, username: user?.username, avatar_url: user?.avatarUrl, rank_title: user?.rankTitle }, ...prev]);
      setComment('');
    } catch {
      toast.error('Failed to post comment');
    }
    setPosting(false);
  }

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
      <div className="glass-card h-56 shimmer" />
      <div className="glass-card h-40 shimmer" />
    </div>
  );

  if (!match) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="text-gray-400">Match not found</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <MatchCard match={match} userPrediction={userPrediction} />

      {/* Match info */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-black text-white mb-4">Match Details</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            { label: 'Venue', value: match.venue || 'TBD' },
            { label: 'Round', value: match.round ? `Round ${match.round}` : 'TBD' },
            { label: 'Total Predictions', value: match.totalPredictions || 0 },
            { label: 'Home Win %', value: `${match.homePredictPct || 0}%` },
            { label: 'Draw %', value: `${match.drawPredictPct || 0}%` },
            { label: 'Away Win %', value: `${match.awayPredictPct || 0}%` },
          ].map((item) => (
            <div key={item.label} className="flex flex-col">
              <span className="text-gray-500 text-xs uppercase tracking-wide">{item.label}</span>
              <span className="text-white font-medium mt-1">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Comments */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <MessageCircle className="w-5 h-5 text-brand-green" />
          <h2 className="text-lg font-black text-white">Discussion ({comments.length})</h2>
        </div>

        {isAuthenticated && (
          <form onSubmit={postComment} className="flex gap-3 mb-6">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts..."
              maxLength={500}
              className="input-field flex-1"
            />
            <button type="submit" disabled={posting || !comment.trim()} className="btn-primary !px-4 !py-3 shrink-0">
              {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        )}

        <div className="space-y-4">
          {comments.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-6">Be the first to comment!</p>
          )}
          {comments.map((c, i) => (
            <motion.div key={c.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-green/20 flex items-center justify-center text-brand-green text-xs font-black shrink-0">
                {(c.username || 'U').slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white text-sm font-semibold">{c.username}</span>
                  <span className="text-gray-600 text-xs">{formatRelative(c.created_at)}</span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{c.content}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
