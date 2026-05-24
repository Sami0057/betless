'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Calendar, Globe, ChevronUp } from 'lucide-react';
import { leaderboardApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { LeaderboardEntry } from '@betless/shared';
import LeaderboardRow from '@/components/ui/LeaderboardRow';
import { cn } from '@/lib/utils';

const TABS = [
  { key: 'global', label: 'All Time', icon: Globe },
  { key: 'weekly', label: 'This Week', icon: Calendar },
  { key: 'monthly', label: 'This Month', icon: Calendar },
  { key: 'streak', label: 'Top Streaks', icon: Flame },
];

export default function LeaderboardPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('global');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        let res;
        if (activeTab === 'global') res = await leaderboardApi.global();
        else if (activeTab === 'weekly') res = await leaderboardApi.weekly();
        else if (activeTab === 'monthly') res = await leaderboardApi.monthly();
        else res = await leaderboardApi.streak();

        setEntries(res.data.data || []);

        if (user) {
          const rankRes = await leaderboardApi.myRank();
          setMyRank(rankRes.data.data?.globalRank || null);
        }
      } catch {}
      setLoading(false);
    }
    load();
  }, [activeTab, user]);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-brand-gold/15 border border-brand-gold/30 flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-brand-gold" />
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Leaderboard</h1>
        <p className="text-gray-400">The top predictors in the Saudi League community</p>

        {myRank && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-brand-green/15 border border-brand-green/30"
          >
            <ChevronUp className="w-4 h-4 text-brand-green" />
            <span className="text-brand-green font-semibold text-sm">Your Rank: #{myRank}</span>
          </motion.div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              'flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
              activeTab === key
                ? 'bg-brand-green text-black font-bold'
                : 'bg-brand-card border border-brand-border text-gray-400 hover:text-white'
            )}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="glass-card h-16 shimmer" />)}
        </div>
      ) : (
        <>
          {/* Top 3 podium */}
          {top3.length > 0 && activeTab !== 'streak' && (
            <div className="mb-6 grid grid-cols-3 gap-3">
              {/* 2nd place */}
              {top3[1] && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-col items-center mt-8"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gray-400/20 border-2 border-gray-400/50 flex items-center justify-center text-gray-300 font-black text-sm mb-2">
                    {top3[1].avatarUrl
                      ? <img src={top3[1].avatarUrl} className="w-12 h-12 rounded-2xl object-cover" alt="" />
                      : top3[1].username.slice(0, 2).toUpperCase()
                    }
                  </div>
                  <span className="text-2xl mb-1">🥈</span>
                  <p className="text-white text-xs font-semibold truncate max-w-[80px] text-center">{top3[1].username}</p>
                  <p className="text-gray-400 text-xs">{top3[1].totalPoints} pts</p>
                </motion.div>
              )}

              {/* 1st place */}
              {top3[0] && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-yellow-400/20 border-2 border-yellow-400/50 flex items-center justify-center text-yellow-300 font-black mb-2">
                    {top3[0].avatarUrl
                      ? <img src={top3[0].avatarUrl} className="w-14 h-14 rounded-2xl object-cover" alt="" />
                      : top3[0].username.slice(0, 2).toUpperCase()
                    }
                  </div>
                  <span className="text-3xl mb-1">👑</span>
                  <p className="text-white text-sm font-bold truncate max-w-[90px] text-center">{top3[0].username}</p>
                  <p className="text-brand-gold text-xs font-semibold">{top3[0].totalPoints} pts</p>
                </motion.div>
              )}

              {/* 3rd place */}
              {top3[2] && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="flex flex-col items-center mt-8"
                >
                  <div className="w-12 h-12 rounded-2xl bg-orange-400/20 border-2 border-orange-400/50 flex items-center justify-center text-orange-300 font-black text-sm mb-2">
                    {top3[2].avatarUrl
                      ? <img src={top3[2].avatarUrl} className="w-12 h-12 rounded-2xl object-cover" alt="" />
                      : top3[2].username.slice(0, 2).toUpperCase()
                    }
                  </div>
                  <span className="text-2xl mb-1">🥉</span>
                  <p className="text-white text-xs font-semibold truncate max-w-[80px] text-center">{top3[2].username}</p>
                  <p className="text-gray-400 text-xs">{top3[2].totalPoints} pts</p>
                </motion.div>
              )}
            </div>
          )}

          {/* Full list */}
          <div className="glass-card p-2 space-y-1">
            {entries.map((entry, i) => (
              <LeaderboardRow
                key={entry.userId}
                entry={entry}
                index={i}
                showStreak={activeTab === 'streak'}
                currentUserId={user?.id}
              />
            ))}
            {entries.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No data yet</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
