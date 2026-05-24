'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ReactNode;
  accent?: 'green' | 'gold' | 'default';
  className?: string;
  index?: number;
}

export default function StatCard({ label, value, sub, icon, accent = 'default', className, index = 0 }: StatCardProps) {
  const accentClasses = {
    green: 'border-brand-green/20 bg-brand-green/5',
    gold: 'border-brand-gold/20 bg-brand-gold/5',
    default: 'border-brand-border/60',
  };

  const valueClasses = {
    green: 'text-brand-green',
    gold: 'text-brand-gold',
    default: 'text-white',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn('glass-card p-4', accentClasses[accent], className)}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">{label}</p>
          <p className={cn('text-2xl font-black mt-1', valueClasses[accent])}>{value}</p>
          {sub && <p className="text-gray-500 text-xs mt-0.5">{sub}</p>}
        </div>
        {icon && (
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center',
            accent === 'green' ? 'bg-brand-green/15' : accent === 'gold' ? 'bg-brand-gold/15' : 'bg-brand-card'
          )}>
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
}
