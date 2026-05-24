'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Target, Flame, Trophy, Star, Calendar, TrendingUp, Shield } from 'lucide-react';
import { usersApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { getRankColor, getRankIcon, formatDate, formatPoints, getSuccessRateColor, cn } from '@/lib/utils';
import RankBadge from '@/components/ui/RankBadge';
import StatCard from '@/components/ui/StatCard';
import { RankTitle } from '@betless/shared';

interface ProfileData {
  id: string;
  username: string;
  avatarUrl?: string;
  rankTitle: RankTitle;
  totalPoints: number;
  totalPredictions: number;
  correctPredictions: number;
  currentStreak: number;
  longestStreak: number;
  successRate: number;
  favoriteTeam?: string;
  favoriteTeamLogo?: string;
  createdAt: string;
  badgeCount: number;
  badges: {
    id: string; name: string; icon: string; rarity: string;
    description: string; earned_at: string;
  }[];
  recentPredictions: {
    prediction: string; status: string; points_earned: number;
    match_date: string; home_short: string; away_short: string;
    home_score?: number; away_score?: number;
  }[];
}

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const isOwn = currentUser?.username === username;

  useEffect(() => {
    async function load() {
      try {
        const res = await usersApi.getProfile(username);
        setProfile(res.data.data);
      } catch {
        setNotFound(true);
      }
      setLoading(false);
    }
    load();
  }, [username]);

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="glass-card h-48 shimmer" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => <div key={i} className="glass-card h-24 shimmer" />)}
      </div>
    </div>
  );

  if (notFound || !profile) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
      <h2 className="text-2xl font-black text-white mb-2">Profile Not Found</h2>
      <p className="text-gray-500">This user doesn't exist or may have been removed.</p>
    </div>
  );

  const rankColor = getRankColor(profile.rankTitle);
  const rateColor = getSuccessRateColor(profile.successRate);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Profile header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div
            className="relative w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-black text-black shrink-0 border-4"
            style={{ backgroundColor: rankColor, borderColor: rankColor + '60' }}
          >
            {profile.avatarUrl
              ? <img src={profile.avatarUrl} alt={profile.username} className="w-24 h-24 rounded-2xl object-cover" />
              : profile.username.slice(0, 2).toUpperCase()
            }
            <div
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg border-2 border-brand-dark flex items-center justify-center text-lg"
              style={{ backgroundColor: rankColor + '30' }}
            >
              {getRankIcon(profile.rankTitle)}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
              <h1 className="text-2xl font-black text-white">{profile.username}</h1>
              {isOwn && (
                <span className="px-2 py-0.5 rounded-full bg-brand-green/15 border border-brand-green/30 text-brand-green text-xs">You</span>
              )}
            </div>
            <div className="flex justify-center sm:justify-start mb-3">
              <RankBadge rank={profile.rankTitle} size="md" />
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-gray-400">
              {profile.favoriteTeam && (
                <span className="flex items-center gap-1.5">
                  <span>❤️</span> {profile.favoriteTeam}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Joined {formatDate(profile.createdAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                {profile.badgeCount} badges
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Points"
          value={formatPoints(profile.totalPoints)}
          icon={<Star className="w-5 h-5 text-brand-green" />}
          accent="green"
          index={0}
        />
        <StatCard
          label="Accuracy"
          value={`${profile.successRate}%`}
          sub={`${profile.correctPredictions} correct`}
          icon={<Target className="w-5 h-5 text-brand-gold" />}
          accent="gold"
          index={1}
        />
        <StatCard
          label="Current Streak"
          value={profile.currentStreak}
          sub={`Best: ${profile.longestStreak}`}
          icon={<Flame className="w-5 h-5 text-orange-400" />}
          index={2}
        />
        <StatCard
          label="Total Predictions"
          value={profile.totalPredictions}
          icon={<TrendingUp className="w-5 h-5 text-blue-400" />}
          index={3}
        />
      </div>

      {/* Badges */}
      {profile.badges.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-brand-gold" /> Badges & Achievements
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {profile.badges.map((badge) => (
              <div
                key={badge.id}
                className={cn('text-center p-3 rounded-xl border transition-all', `badge-${badge.rarity}`)}
              >
                <span className="text-2xl block mb-1">{badge.icon}</span>
                <p className="text-xs font-semibold leading-tight">{badge.name}</p>
                <p className="text-gray-500 text-xs mt-0.5">{formatDate(badge.earned_at)}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent predictions */}
      {profile.recentPredictions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <h2 className="text-lg font-black text-white mb-4">Recent Predictions</h2>
          <div className="space-y-2">
            {profile.recentPredictions.map((pred, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-brand-border/30 last:border-0">
                <div className="flex items-center gap-3">
                  <span className={cn(
                    'w-2 h-2 rounded-full shrink-0',
                    pred.status === 'correct' ? 'bg-brand-green' :
                    pred.status === 'incorrect' ? 'bg-red-400' : 'bg-gray-500'
                  )} />
                  <div>
                    <p className="text-white text-sm font-medium">
                      {pred.home_short} vs {pred.away_short}
                    </p>
                    <p className="text-gray-500 text-xs">{formatDate(pred.match_date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold capitalize" style={{
                    color: pred.status === 'correct' ? '#00E676' : pred.status === 'incorrect' ? '#EF4444' : '#6B7280'
                  }}>
                    {pred.prediction}
                  </p>
                  {pred.status === 'correct' && (
                    <p className="text-brand-green text-xs">+{pred.points_earned} pts</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
