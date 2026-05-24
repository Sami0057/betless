import { Request, Response } from 'express';
import { query } from '../db/client';
import { AuthRequest } from '../middleware/auth';

export async function getGlobalLeaderboard(req: Request, res: Response): Promise<void> {
  const { limit = '50', page = '1' } = req.query;
  const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

  const rows = await query(
    `SELECT
       ROW_NUMBER() OVER (ORDER BY u.total_points DESC) as rank,
       u.id, u.username, u.avatar_url, u.rank_title,
       u.total_points, u.correct_predictions, u.total_predictions,
       u.current_streak,
       CASE WHEN u.total_predictions > 0
            THEN ROUND((u.correct_predictions::numeric / u.total_predictions) * 100)
            ELSE 0
       END as success_rate
     FROM users u
     WHERE u.is_banned = false AND u.role = 'user'
     ORDER BY u.total_points DESC
     LIMIT $1 OFFSET $2`,
    [parseInt(limit as string), offset]
  );

  res.json({ success: true, data: rows });
}

export async function getWeeklyLeaderboard(req: Request, res: Response): Promise<void> {
  const { limit = '50' } = req.query;

  const weekStart = getWeekStart();

  const rows = await query(
    `SELECT
       ROW_NUMBER() OVER (ORDER BY SUM(p.points_earned) DESC) as rank,
       u.id, u.username, u.avatar_url, u.rank_title,
       SUM(p.points_earned) as weekly_points,
       COUNT(CASE WHEN p.status = 'correct' THEN 1 END) as correct,
       COUNT(p.id) as total
     FROM users u
     JOIN predictions p ON p.user_id = u.id
     JOIN matches m ON p.match_id = m.id
     WHERE m.kickoff_time >= $1 AND u.is_banned = false
     GROUP BY u.id, u.username, u.avatar_url, u.rank_title
     HAVING COUNT(p.id) > 0
     ORDER BY weekly_points DESC
     LIMIT $2`,
    [weekStart, parseInt(limit as string)]
  );

  res.json({ success: true, data: rows, period: { start: weekStart, label: 'This Week' } });
}

export async function getMonthlyLeaderboard(req: Request, res: Response): Promise<void> {
  const { limit = '50' } = req.query;

  const monthStart = getMonthStart();

  const rows = await query(
    `SELECT
       ROW_NUMBER() OVER (ORDER BY SUM(p.points_earned) DESC) as rank,
       u.id, u.username, u.avatar_url, u.rank_title,
       SUM(p.points_earned) as monthly_points,
       COUNT(CASE WHEN p.status = 'correct' THEN 1 END) as correct,
       COUNT(p.id) as total
     FROM users u
     JOIN predictions p ON p.user_id = u.id
     JOIN matches m ON p.match_id = m.id
     WHERE m.kickoff_time >= $1 AND u.is_banned = false
     GROUP BY u.id, u.username, u.avatar_url, u.rank_title
     HAVING COUNT(p.id) > 0
     ORDER BY monthly_points DESC
     LIMIT $2`,
    [monthStart, parseInt(limit as string)]
  );

  res.json({ success: true, data: rows, period: { start: monthStart, label: 'This Month' } });
}

export async function getStreakLeaderboard(req: Request, res: Response): Promise<void> {
  const { limit = '50' } = req.query;

  const rows = await query(
    `SELECT
       ROW_NUMBER() OVER (ORDER BY u.longest_streak DESC) as rank,
       u.id, u.username, u.avatar_url, u.rank_title,
       u.current_streak, u.longest_streak, u.total_points
     FROM users u
     WHERE u.is_banned = false AND u.role = 'user' AND u.longest_streak > 0
     ORDER BY u.longest_streak DESC
     LIMIT $1`,
    [parseInt(limit as string)]
  );

  res.json({ success: true, data: rows });
}

export async function getUserRank(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.id;

  const [globalRank] = await query<{ rank: string }>(
    `SELECT rank FROM (
       SELECT id, ROW_NUMBER() OVER (ORDER BY total_points DESC) as rank
       FROM users WHERE is_banned = false AND role = 'user'
     ) ranked WHERE id = $1`,
    [userId]
  );

  res.json({ success: true, data: { globalRank: globalRank ? parseInt(globalRank.rank) : null } });
}

function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getMonthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}
