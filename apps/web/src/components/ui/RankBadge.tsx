'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { RankTitle, RANK_CONFIG } from '@betless/shared';
import { cn } from '@/lib/utils';

interface RankBadgeProps {
  rank: RankTitle;
  size?: 'sm' | 'md' | 'lg';
  showAnimation?: boolean;
  className?: string;
}

export default function RankBadge({ rank, size = 'md', showAnimation, className }: RankBadgeProps) {
  const config = RANK_CONFIG[rank];

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-3 py-1 gap-1.5',
    lg: 'text-base px-4 py-2 gap-2',
  };

  return (
    <motion.span
      className={cn('rank-badge border', sizeClasses[size], className)}
      style={{
        color: config.color,
        borderColor: config.color + '40',
        backgroundColor: config.color + '15',
      }}
      animate={showAnimation ? { scale: [1, 1.2, 1], opacity: [0, 1] } : {}}
      transition={{ duration: 0.6, type: 'spring' }}
    >
      <span>{config.icon}</span>
      <span className="font-semibold">{rank}</span>
    </motion.span>
  );
}

// Full-screen rank-up animation overlay
export function RankUpAnimation({ newRank, onComplete }: { newRank: RankTitle; onComplete: () => void }) {
  const config = RANK_CONFIG[newRank];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onComplete}
      >
        <motion.div
          className="text-center px-8"
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 12 }}
        >
          {/* Glow ring */}
          <motion.div
            className="w-40 h-40 rounded-full mx-auto mb-6 flex items-center justify-center relative"
            style={{ backgroundColor: config.color + '20', border: `2px solid ${config.color}50` }}
            animate={{ boxShadow: [`0 0 20px ${config.color}30`, `0 0 60px ${config.color}60`, `0 0 20px ${config.color}30`] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-7xl">{config.icon}</span>
          </motion.div>

          <motion.p
            className="text-gray-400 text-lg mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Rank Up!
          </motion.p>
          <motion.h2
            className="text-4xl font-black mb-2"
            style={{ color: config.color }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {newRank}
          </motion.h2>
          <motion.p
            className="text-gray-500 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Tap to continue
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
