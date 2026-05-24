import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { queryOne } from '../db/client';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    username: string;
  };
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyAccessToken(token);
    const user = await queryOne<{ id: string; email: string; role: string; username: string; is_banned: boolean }>(
      'SELECT id, email, role, username, is_banned FROM users WHERE id = $1',
      [payload.userId]
    );

    if (!user) {
      res.status(401).json({ success: false, error: 'User not found' });
      return;
    }
    if (user.is_banned) {
      res.status(403).json({ success: false, error: 'Account suspended' });
      return;
    }

    req.user = { id: user.id, email: user.email, role: user.role, username: user.username };
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ success: false, error: 'Admin access required' });
    return;
  }
  next();
}

export function requireModerator(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || !['admin', 'moderator'].includes(req.user.role)) {
    res.status(403).json({ success: false, error: 'Moderator access required' });
    return;
  }
  next();
}
