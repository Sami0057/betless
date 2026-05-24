// ============================================================
// BETLESS - Shared Types Package
// Shared between web, api, and mobile applications
// ============================================================

// ─── User Types ────────────────────────────────────────────

export type UserRole = 'user' | 'admin' | 'moderator';

export type RankTitle =
  | 'Newcomer'
  | 'Rookie Analyst'
  | 'Bronze Expert'
  | 'Silver Strategist'
  | 'Gold Analyst'
  | 'Elite Predictor'
  | 'Master Forecaster'
  | 'Legend';

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  rankTitle: RankTitle;
  totalPoints: number;
  totalPredictions: number;
  correctPredictions: number;
  currentStreak: number;
  longestStreak: number;
  favoriteTeam?: string;
  isVerified: boolean;
  isBanned: boolean;
  language: 'en' | 'ar';
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  successRate: number;
  badges: Badge[];
  recentPredictions: Prediction[];
  rank: number;
}

// ─── Match Types ────────────────────────────────────────────

export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled';
export type PredictionOutcome = 'home' | 'draw' | 'away';

export interface Team {
  id: string;
  name: string;
  nameAr: string;
  shortName: string;
  logo: string;
  primaryColor: string;
  stadium?: string;
  founded?: number;
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  matchDate: string;
  kickoffTime: string;
  status: MatchStatus;
  round: number;
  season: string;
  venue?: string;
  homeScore?: number;
  awayScore?: number;
  result?: PredictionOutcome;
  homePredictPercentage?: number;
  drawPredictPercentage?: number;
  awayPredictPercentage?: number;
  totalPredictions?: number;
  externalId?: string;
}

// ─── Prediction Types ───────────────────────────────────────

export type PredictionStatus = 'pending' | 'correct' | 'incorrect';

export interface Prediction {
  id: string;
  userId: string;
  matchId: string;
  prediction: PredictionOutcome;
  status: PredictionStatus;
  pointsEarned: number;
  match?: Match;
  createdAt: string;
  updatedAt: string;
}

// ─── Achievement & Badge Types ──────────────────────────────

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Badge {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
  rarity: BadgeRarity;
  requirement: string;
  pointsRequired?: number;
  streakRequired?: number;
  teamId?: string;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  badge: Badge;
  earnedAt: string;
}

// ─── Leaderboard Types ──────────────────────────────────────

export type LeaderboardPeriod = 'all_time' | 'weekly' | 'monthly' | 'streak';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl?: string;
  rankTitle: RankTitle;
  totalPoints: number;
  correctPredictions: number;
  totalPredictions: number;
  successRate: number;
  currentStreak: number;
}

// ─── Notification Types ─────────────────────────────────────

export type NotificationType =
  | 'match_starting'
  | 'prediction_result'
  | 'rank_upgrade'
  | 'badge_earned'
  | 'announcement'
  | 'streak_milestone';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// ─── Comment Types ──────────────────────────────────────────

export interface Comment {
  id: string;
  matchId: string;
  userId: string;
  user: Pick<User, 'id' | 'username' | 'avatarUrl' | 'rankTitle'>;
  content: string;
  emoji?: string;
  likes: number;
  createdAt: string;
}

// ─── API Response Types ─────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Rank Configuration ─────────────────────────────────────

export const RANK_CONFIG: Record<RankTitle, { minWins: number; color: string; icon: string }> = {
  Newcomer: { minWins: 0, color: '#6B7280', icon: '🌱' },
  'Rookie Analyst': { minWins: 10, color: '#10B981', icon: '📊' },
  'Bronze Expert': { minWins: 20, color: '#CD7F32', icon: '🥉' },
  'Silver Strategist': { minWins: 35, color: '#C0C0C0', icon: '⚡' },
  'Gold Analyst': { minWins: 40, color: '#FFD700', icon: '🥇' },
  'Elite Predictor': { minWins: 60, color: '#8B5CF6', icon: '🎯' },
  'Master Forecaster': { minWins: 80, color: '#F97316', icon: '🔮' },
  Legend: { minWins: 100, color: '#EF4444', icon: '👑' },
};

export const POINTS_PER_CORRECT_PREDICTION = 10;
export const STREAK_BONUS_MULTIPLIER = 1.5;
export const STREAK_BONUS_THRESHOLD = 3;

export function getRankFromWins(wins: number): RankTitle {
  const ranks = Object.entries(RANK_CONFIG).reverse() as [RankTitle, { minWins: number }][];
  for (const [rank, config] of ranks) {
    if (wins >= config.minWins) return rank;
  }
  return 'Newcomer';
}

export function calculateSuccessRate(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}
