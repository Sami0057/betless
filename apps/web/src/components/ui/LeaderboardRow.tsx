'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Flame, Crown, Medal } from 'lucide-react';
import { LeaderboardEntry } from '@betless/shared';
import { getRankColor, getRankIcon, avatarFallback, formatPoints, getPositionStyle, cn } from '@/lib/utils';

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  index: number;
  showStreak?: boolean;
  currentUserId?: string;
}

const POSITION_ICONS = [
  <Crown key="1" className="w-4 h-4 text-yellow-400" />,
  <Medal key="2" className="w-4 h-4 text-gray-300" />,
  <Medal key="3" className="w-4 h-4 text-orange-400" />,
];

export default function LeaderboardRow({ entry, index, showStreak, currentUserId }: LeaderboardRowProps) {
  const isCurrentUser = currentUserId === entry.userId;
  const posStyle = getPositionStyle(entry.rank);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
        isCurrentUser
          ? 'bg-brand-green/10 border border-brand-green/20'
          : 'hover:bg-brand-card/50 border border-transparent',
      )}
    >
      {/* Rank */}
      <div className={cn(
        'w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold border shrink-0',
        posStyle || 'border-brand-border text-gray-400'
      )}>
        {entry.rank <= 3 ? POSITION_ICONS[entry.rank - 1] : entry.rank}
      </div>

      {/* Avatar */}
      <Link href={`/profile/${entry.username}`} className="shrink-0">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-black"
          style={{ backgroundColor: getRankColor(entry.rankTitle) }}
        >
          {entry.avatarUrl
            ? <img src={entry.avatarUrl} alt="" className="w-9 h-9 rounded-xl object-cover" />
            : avatarFallback(entry.username)
          }
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link href={`/profile/${entry.username}`} className="text-white font-semibold text-sm hover:text-brand-green transition-colors truncate">
            {entry.username}
            {isCurrentUser && <span className="ml-1 text-brand-green text-xs">(You)</span>}
          </Link>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs" style={{ color: getRankColor(entry.rankTitle) }}>
            {getRankIcon(entry.rankTitle)} {entry.rankTitle}
          </span>
          <span className="text-gray-600 text-xs">·</span>
          <span className="text-gray-400 text-xs">{entry.successRate}% accuracy</span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 shrink-0">
        {showStreak ? (
          <div className="flex items-center gap-1">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-white font-bold text-sm">{entry.currentStreak}</span>
          </div>
        ) : (
          <div className="text-right">
            <p className="text-brand-green font-bold text-sm">{formatPoints(entry.totalPoints)}</p>
            <p className="text-gray-500 text-xs">{entry.correctPredictions}✓</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
