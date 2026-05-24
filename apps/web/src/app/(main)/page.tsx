'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  TrendingUp, Users, Star, Zap, ArrowRight, Trophy,
  Calendar, Flame, Shield, Target,
} from 'lucide-react';
import { matchesApi, leaderboardApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import MatchCard from '@/components/ui/MatchCard';
import LeaderboardRow from '@/components/ui/LeaderboardRow';
import StatCard from '@/components/ui/StatCard';
import { Match, LeaderboardEntry } from '@betless/shared';
import { getRankColor, getRankIcon, formatPoints } from '@/lib/utils';

export default function HomePage() {
  const { user, isAuthenticated } = useAuthStore();
  const [todayMatches, setTodayMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [topPlayers, setTopPlayers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [todayRes, upcomingRes, leaderRes] = await Promise.all([
          matchesApi.getToday(),
          matchesApi.getUpcoming(),
          leaderboardApi.global({ limit: '5' }),
        ]);
        setTodayMatches(todayRes.data.data || []);
        setUpcomingMatches(upcomingRes.data.data || []);
        setTopPlayers(leaderRes.data.data || []);
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-dark via-brand-card to-brand-dark border border-brand-border">
        {/* Background glow effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-brand-green/8 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-brand-gold/8 rounded-full blur-3xl" />
        </div>

        <div className="relative px-8 py-12 md:py-16">
          {isAuthenticated && user ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3 mb-4">
                <span style={{ color: getRankColor(user.rankTitle) }} className="text-3xl">
                  {getRankIcon(user.rankTitle)}
                </span>
                <span className="text-gray-400 text-lg">Welcome back,</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
                {user.username}
              </h1>
              <p className="text-xl font-semibold mb-6" style={{ color: getRankColor(user.rankTitle) }}>
                {user.rankTitle}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="glass-card p-3 text-center">
                  <p className="text-brand-green text-2xl font-black">{formatPoints(user.totalPoints)}</p>
                  <p className="text-gray-400 text-xs">Total Points</p>
                </div>
                <div className="glass-card p-3 text-center">
                  <p className="text-white text-2xl font-black">{user.correctPredictions}</p>
                  <p className="text-gray-400 text-xs">Correct</p>
                </div>
                <div className="glass-card p-3 text-center">
                  <p className="text-orange-400 text-2xl font-black">{user.currentStreak}</p>
                  <p className="text-gray-400 text-xs">Streak 🔥</p>
                </div>
                <div className="glass-card p-3 text-center">
                  <p className="text-brand-gold text-2xl font-black">
                    {user.totalPredictions > 0
                      ? Math.round((user.correctPredictions / user.totalPredictions) * 100)
                      : 0}%
                  </p>
                  <p className="text-gray-400 text-xs">Accuracy</p>
                </div>
              </div>

              <Link href="/matches" className="btn-primary inline-flex items-center gap-2">
                <Target className="w-4 h-4" /> Predict Today's Matches
              </Link>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-green/15 border border-brand-green/30 mb-6">
                <Star className="w-3.5 h-3.5 text-brand-green" />
                <span className="text-brand-green text-sm font-medium">#1 Saudi League Prediction Platform</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-white mb-4 leading-tight">
                Predict.<br />
                <span className="text-gradient-green">Compete.</span><br />
                Dominate.
              </h1>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Make predictions on Saudi Pro League matches, earn points, climb the leaderboard,
                and unlock legendary status. No gambling — just pure skill.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/register" className="btn-primary inline-flex items-center gap-2">
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/matches" className="btn-secondary inline-flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> View Matches
                </Link>
              </div>

              {/* Feature chips */}
              <div className="flex flex-wrap gap-2 mt-8">
                {['No gambling', 'Free to play', 'Saudi League only', 'Real-time rankings'].map((feat) => (
                  <span key={feat} className="px-3 py-1 rounded-full bg-brand-card border border-brand-border text-gray-400 text-xs">
                    ✓ {feat}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Platform stats */}
      {!isAuthenticated && (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Predictors', value: '12K+', icon: <Users className="w-5 h-5 text-brand-green" />, accent: 'green' as const },
            { label: 'Predictions Made', value: '280K+', icon: <Target className="w-5 h-5 text-brand-gold" />, accent: 'gold' as const },
            { label: 'Matches Covered', value: '500+', icon: <Calendar className="w-5 h-5 text-brand-green" />, accent: 'green' as const },
            { label: 'Badges Awarded', value: '45K+', icon: <Shield className="w-5 h-5 text-brand-gold" />, accent: 'gold' as const },
          ].map((stat, i) => (
            <StatCard key={stat.label} {...stat} index={i} />
          ))}
        </section>
      )}

      {/* Today's Matches */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-white">Today's Matches</h2>
            <p className="text-gray-500 text-sm mt-1">Make your predictions before kickoff</p>
          </div>
          <Link href="/matches" className="flex items-center gap-1 text-brand-green text-sm hover:gap-2 transition-all">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="glass-card h-48 shimmer" />
            ))}
          </div>
        ) : todayMatches.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {todayMatches.slice(0, 4).map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No matches today</p>
            <p className="text-gray-600 text-sm mt-1">Check back for upcoming fixtures</p>
          </div>
        )}
      </section>

      {/* Two column: upcoming + leaderboard */}
      <div className="grid lg:grid-cols-5 gap-8">
        {/* Upcoming Matches */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-white">Upcoming</h2>
            <Link href="/matches?status=scheduled" className="text-brand-green text-sm hover:underline">See all</Link>
          </div>
          <div className="space-y-3">
            {loading
              ? [1, 2, 3].map((i) => <div key={i} className="glass-card h-24 shimmer" />)
              : upcomingMatches.slice(0, 5).map((match) => (
                  <MatchCard key={match.id} match={match} compact />
                ))
            }
          </div>
        </div>

        {/* Top Leaderboard */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-white">Top Predictors</h2>
            <Link href="/leaderboard" className="text-brand-green text-sm hover:underline">Full board</Link>
          </div>
          <div className="glass-card p-2 space-y-1">
            {loading
              ? [1, 2, 3, 4, 5].map((i) => <div key={i} className="h-14 rounded-xl shimmer" />)
              : topPlayers.map((entry, i) => (
                  <LeaderboardRow
                    key={entry.userId}
                    entry={entry}
                    index={i}
                    currentUserId={user?.id}
                  />
                ))
            }
            <Link
              href="/leaderboard"
              className="flex items-center justify-center gap-2 py-3 text-brand-green text-sm font-medium hover:bg-brand-green/5 rounded-xl transition-colors"
            >
              <Trophy className="w-4 h-4" /> View Full Leaderboard
            </Link>
          </div>
        </div>
      </div>

      {/* Rank system preview */}
      <section className="glass-card p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-white mb-2">Earn Your Rank</h2>
          <p className="text-gray-400">Correct predictions unlock legendary status</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { title: 'Newcomer', icon: '🌱', wins: 0, color: '#6B7280' },
            { title: 'Rookie', icon: '📊', wins: 10, color: '#10B981' },
            { title: 'Bronze', icon: '🥉', wins: 20, color: '#CD7F32' },
            { title: 'Silver', icon: '⚡', wins: 35, color: '#C0C0C0' },
            { title: 'Gold', icon: '🥇', wins: 40, color: '#FFD700' },
            { title: 'Elite', icon: '🎯', wins: 60, color: '#8B5CF6' },
            { title: 'Master', icon: '🔮', wins: 80, color: '#F97316' },
            { title: 'Legend', icon: '👑', wins: 100, color: '#EF4444' },
          ].map((rank) => (
            <div key={rank.title} className="text-center p-3 rounded-xl border border-brand-border hover:border-opacity-60 transition-all"
              style={{ borderColor: rank.color + '30', backgroundColor: rank.color + '08' }}>
              <span className="text-2xl">{rank.icon}</span>
              <p className="text-xs font-semibold mt-1" style={{ color: rank.color }}>{rank.title}</p>
              <p className="text-gray-600 text-xs">{rank.wins}+ wins</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
