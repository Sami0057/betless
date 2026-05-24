import { Request, Response } from 'express';
import { query, queryOne } from '../db/client';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export async function getProfile(req: Request, res: Response): Promise<void> {
  const { username } = req.params;

  const user = await queryOne<Record<string, unknown>>(
    `SELECT u.id, u.username, u.avatar_url, u.rank_title,
            u.total_points, u.total_predictions, u.correct_predictions,
            u.current_streak, u.longest_streak, u.created_at,
            t.name as favorite_team, t.logo as favorite_team_logo,
            CASE WHEN u.total_predictions > 0
                 THEN ROUND((u.correct_predictions::numeric / u.total_predictions) * 100)
                 ELSE 0
            END as success_rate,
            (SELECT COUNT(*) FROM user_badges ub WHERE ub.user_id = u.id) as badge_count
     FROM users u
     LEFT JOIN teams t ON u.favorite_team_id = t.id
     WHERE u.username = $1 AND u.is_banned = false`,
    [username]
  );

  if (!user) throw new AppError('User not found', 404);

  const badges = await query(
    `SELECT b.*, ub.earned_at FROM badges b
     JOIN user_badges ub ON ub.badge_id = b.id
     WHERE ub.user_id = $1
     ORDER BY ub.earned_at DESC`,
    [user.id as string]
  );

  const recentPredictions = await query(
    `SELECT p.prediction, p.status, p.points_earned,
            m.match_date, m.kickoff_time,
            ht.short_name as home_short, at.short_name as away_short,
            m.home_score, m.away_score
     FROM predictions p
     JOIN matches m ON p.match_id = m.id
     JOIN teams ht ON m.home_team_id = ht.id
     JOIN teams at ON m.away_team_id = at.id
     WHERE p.user_id = $1
     ORDER BY m.kickoff_time DESC
     LIMIT 10`,
    [user.id as string]
  );

  res.json({ success: true, data: { ...user, badges, recentPredictions } });
}

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { username, favoriteTeamId, language, avatarUrl } = req.body;

  if (username) {
    const taken = await queryOne(
      'SELECT id FROM users WHERE username = $1 AND id != $2',
      [username, userId]
    );
    if (taken) throw new AppError('Username already taken', 409);
  }

  const [user] = await query(
    `UPDATE users SET
       username = COALESCE($1, username),
       favorite_team_id = COALESCE($2, favorite_team_id),
       language = COALESCE($3, language),
       avatar_url = COALESCE($4, avatar_url),
       updated_at = NOW()
     WHERE id = $5
     RETURNING id, username, email, avatar_url, rank_title, total_points, language`,
    [username, favoriteTeamId, language, avatarUrl, userId]
  );

  res.json({ success: true, data: user });
}

export async function getUserStats(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.id;

  const [stats] = await query(
    `SELECT
       total_predictions,
       correct_predictions,
       total_predictions - correct_predictions as incorrect_predictions,
       current_streak,
       longest_streak,
       total_points,
       CASE WHEN total_predictions > 0
            THEN ROUND((correct_predictions::numeric / total_predictions) * 100)
            ELSE 0
       END as success_rate
     FROM users WHERE id = $1`,
    [userId]
  );

  // Monthly breakdown
  const monthly = await query(
    `SELECT
       TO_CHAR(m.kickoff_time, 'YYYY-MM') as month,
       COUNT(p.id) as total,
       COUNT(CASE WHEN p.status = 'correct' THEN 1 END) as correct,
       SUM(p.points_earned) as points
     FROM predictions p
     JOIN matches m ON p.match_id = m.id
     WHERE p.user_id = $1 AND p.status != 'pending'
     GROUP BY TO_CHAR(m.kickoff_time, 'YYYY-MM')
     ORDER BY month DESC
     LIMIT 6`,
    [userId]
  );

  res.json({ success: true, data: { ...stats, monthly } });
}

// Admin controllers
export async function getAllUsers(req: AuthRequest, res: Response): Promise<void> {
  const { page = '1', limit = '50', search, role, banned } = req.query;
  const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

  const params: unknown[] = [];
  let whereClause = 'WHERE 1=1';

  if (search) {
    params.push(`%${search}%`);
    whereClause += ` AND (username ILIKE $${params.length} OR email ILIKE $${params.length})`;
  }
  if (role) {
    params.push(role);
    whereClause += ` AND role = $${params.length}`;
  }
  if (banned !== undefined) {
    params.push(banned === 'true');
    whereClause += ` AND is_banned = $${params.length}`;
  }

  params.push(parseInt(limit as string), offset);

  const users = await query(
    `SELECT id, username, email, role, rank_title, total_points, correct_predictions,
            is_banned, is_verified, created_at, last_login
     FROM users ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  const [{ total }] = await query<{ total: string }>(
    `SELECT COUNT(*) as total FROM users ${whereClause}`,
    params.slice(0, -2)
  );

  res.json({ success: true, data: users, total: parseInt(total) });
}

export async function banUser(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const { reason } = req.body;

  await query(
    'UPDATE users SET is_banned = true, ban_reason = $1 WHERE id = $2',
    [reason, id]
  );

  // Log admin action
  await query(
    `INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
     VALUES ($1, 'ban_user', 'user', $2, $3)`,
    [req.user!.id, id, JSON.stringify({ reason })]
  );

  res.json({ success: true, message: 'User banned' });
}

export async function unbanUser(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;

  await query('UPDATE users SET is_banned = false, ban_reason = NULL WHERE id = $1', [id]);

  await query(
    `INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
     VALUES ($1, 'unban_user', 'user', $2, $3)`,
    [req.user!.id, id, JSON.stringify({})]
  );

  res.json({ success: true, message: 'User unbanned' });
}
