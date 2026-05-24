import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { RANK_CONFIG, RankTitle } from '@betless/shared';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  }).format(new Date(date));
}

export function formatTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  }).format(new Date(date));
}

export function formatRelative(date: string | Date): string {
  const now = Date.now();
  const d = new Date(date).getTime();
  const diff = now - d;

  if (diff < 60_000) return 'Just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return formatDate(date);
}

export function getCountdown(kickoff: string): string {
  const ms = new Date(kickoff).getTime() - Date.now();
  if (ms <= 0) return 'Live';
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const mins = Math.floor((ms % 3_600_000) / 60_000);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export function getRankColor(rank: RankTitle): string {
  return RANK_CONFIG[rank]?.color || '#6B7280';
}

export function getRankIcon(rank: RankTitle): string {
  return RANK_CONFIG[rank]?.icon || '🌱';
}

export function formatPoints(pts: number): string {
  if (pts >= 1_000_000) return `${(pts / 1_000_000).toFixed(1)}M`;
  if (pts >= 1_000) return `${(pts / 1_000).toFixed(1)}K`;
  return pts.toString();
}

export function getPositionStyle(pos: number): string {
  if (pos === 1) return 'pos-1';
  if (pos === 2) return 'pos-2';
  if (pos === 3) return 'pos-3';
  return '';
}

export function getSuccessRateColor(rate: number): string {
  if (rate >= 70) return 'text-brand-green';
  if (rate >= 50) return 'text-yellow-400';
  if (rate >= 30) return 'text-orange-400';
  return 'text-red-400';
}

export function avatarFallback(username: string): string {
  return username.slice(0, 2).toUpperCase();
}
