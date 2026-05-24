import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query, queryOne } from '../db/client';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { getRankFromWins } from '@betless/shared';

export async function register(req: Request, res: Response): Promise<void> {
  const { username, email, password, language = 'en' } = req.body;

  const existing = await queryOne(
    'SELECT id FROM users WHERE email = $1 OR username = $2',
    [email.toLowerCase(), username.toLowerCase()]
  );
  if (existing) throw new AppError('Email or username already taken', 409);

  const hash = await bcrypt.hash(password, 12);
  const verifyToken = uuidv4();

  const [user] = await query<{ id: string; username: string; email: string; role: string; rank_title: string }>(
    `INSERT INTO users (id, username, email, password_hash, language, email_verify_token, is_verified)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, username, email, role, rank_title`,
    [uuidv4(), username, email.toLowerCase(), hash, language, verifyToken, false]
  );

  const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id, email: user.email, role: user.role });

  await query('UPDATE users SET refresh_token = $1 WHERE id = $2', [refreshToken, user.id]);

  res.status(201).json({
    success: true,
    data: {
      user: { id: user.id, username: user.username, email: user.email, role: user.role, rankTitle: user.rank_title },
      accessToken,
      refreshToken,
    },
    message: 'Registration successful! Please verify your email.',
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  const user = await queryOne<{
    id: string; username: string; email: string; password_hash: string;
    role: string; rank_title: string; is_banned: boolean; is_verified: boolean;
    total_points: number; avatar_url: string;
  }>(
    'SELECT id, username, email, password_hash, role, rank_title, is_banned, is_verified, total_points, avatar_url FROM users WHERE email = $1',
    [email.toLowerCase()]
  );

  if (!user) throw new AppError('Invalid credentials', 401);
  if (user.is_banned) throw new AppError('Account suspended. Contact support.', 403);
  if (!user.password_hash) throw new AppError('Please use social login for this account', 400);

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new AppError('Invalid credentials', 401);

  const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id, email: user.email, role: user.role });

  await query('UPDATE users SET refresh_token = $1, last_login = NOW() WHERE id = $2', [refreshToken, user.id]);

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        rankTitle: user.rank_title,
        totalPoints: user.total_points,
        avatarUrl: user.avatar_url,
        isVerified: user.is_verified,
      },
      accessToken,
      refreshToken,
    },
  });
}

export async function refreshToken(req: Request, res: Response): Promise<void> {
  const { refreshToken: token } = req.body;
  if (!token) throw new AppError('Refresh token required', 400);

  const payload = verifyRefreshToken(token);
  const user = await queryOne<{ id: string; email: string; role: string; refresh_token: string }>(
    'SELECT id, email, role, refresh_token FROM users WHERE id = $1',
    [payload.userId]
  );

  if (!user || user.refresh_token !== token) throw new AppError('Invalid refresh token', 401);

  const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
  const newRefreshToken = signRefreshToken({ userId: user.id, email: user.email, role: user.role });

  await query('UPDATE users SET refresh_token = $1 WHERE id = $2', [newRefreshToken, user.id]);

  res.json({ success: true, data: { accessToken, refreshToken: newRefreshToken } });
}

export async function logout(req: AuthRequest, res: Response): Promise<void> {
  if (req.user) {
    await query('UPDATE users SET refresh_token = NULL WHERE id = $1', [req.user.id]);
  }
  res.json({ success: true, message: 'Logged out successfully' });
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  const user = await queryOne<Record<string, unknown>>(
    `SELECT u.id, u.username, u.email, u.avatar_url, u.role, u.rank_title,
            u.total_points, u.total_predictions, u.correct_predictions,
            u.current_streak, u.longest_streak, u.is_verified, u.language,
            u.created_at, t.name AS favorite_team_name, t.logo AS favorite_team_logo
     FROM users u
     LEFT JOIN teams t ON u.favorite_team_id = t.id
     WHERE u.id = $1`,
    [req.user!.id]
  );

  if (!user) throw new AppError('User not found', 404);

  const successRate = user.total_predictions
    ? Math.round(((user.correct_predictions as number) / (user.total_predictions as number)) * 100)
    : 0;

  res.json({ success: true, data: { ...user, successRate } });
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { email } = req.body;
  const token = uuidv4();
  const expires = new Date(Date.now() + 3600000); // 1 hour

  await query(
    'UPDATE users SET reset_password_token = $1, reset_token_expires = $2 WHERE email = $3',
    [token, expires, email.toLowerCase()]
  );

  // In production, send email with reset link
  res.json({ success: true, message: 'Password reset email sent if account exists' });
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  const { token, password } = req.body;

  const user = await queryOne<{ id: string }>(
    'SELECT id FROM users WHERE reset_password_token = $1 AND reset_token_expires > NOW()',
    [token]
  );

  if (!user) throw new AppError('Invalid or expired reset token', 400);

  const hash = await bcrypt.hash(password, 12);
  await query(
    'UPDATE users SET password_hash = $1, reset_password_token = NULL, reset_token_expires = NULL WHERE id = $2',
    [hash, user.id]
  );

  res.json({ success: true, message: 'Password reset successful' });
}

export async function socialLogin(req: Request, res: Response): Promise<void> {
  const { firebaseUid, email, username, avatarUrl } = req.body;

  let user = await queryOne<{ id: string; username: string; email: string; role: string; rank_title: string; total_points: number }>(
    'SELECT id, username, email, role, rank_title, total_points FROM users WHERE firebase_uid = $1 OR email = $2',
    [firebaseUid, email.toLowerCase()]
  );

  if (!user) {
    // New user via social login
    const safeUsername = username || `user_${uuidv4().slice(0, 8)}`;
    const [created] = await query<{ id: string; username: string; email: string; role: string; rank_title: string; total_points: number }>(
      `INSERT INTO users (id, username, email, firebase_uid, avatar_url, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, username, email, role, rank_title, total_points`,
      [uuidv4(), safeUsername, email.toLowerCase(), firebaseUid, avatarUrl, true]
    );
    user = created;
  } else if (!user) {
    throw new AppError('Social login failed', 400);
  }

  const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id, email: user.email, role: user.role });

  await query('UPDATE users SET refresh_token = $1, last_login = NOW() WHERE id = $2', [refreshToken, user.id]);

  res.json({
    success: true,
    data: {
      user: { id: user.id, username: user.username, email: user.email, role: user.role, rankTitle: user.rank_title, totalPoints: user.total_points },
      accessToken,
      refreshToken,
    },
  });
}
