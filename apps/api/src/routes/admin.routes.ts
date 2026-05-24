import { Router, Request, Response } from 'express';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { query } from '../db/client';
import { syncMatches, syncResults } from '../services/football.service';
import { broadcastNotification } from '../services/notifications.service';
import { processMatchResults } from '../controllers/predictions.controller';

const router = Router();
router.use(authenticate, requireAdmin);

// Analytics
router.get('/analytics', async (_req: Request, res: Response) => {
  const [totals] = await query(`
    SELECT
      (SELECT COUNT(*) FROM users WHERE role = 'user') as total_users,
      (SELECT COUNT(*) FROM users WHERE last_login >= NOW() - INTERVAL '24 hours') as dau,
      (SELECT COUNT(*) FROM predictions) as total_predictions,
      (SELECT COUNT(*) FROM matches WHERE status = 'finished') as matches_finished,
      (SELECT COUNT(*) FROM user_badges) as badges_awarded
  `);

  const userGrowth = await query(`
    SELECT DATE(created_at) as date, COUNT(*) as new_users
    FROM users WHERE created_at >= NOW() - INTERVAL '30 days'
    GROUP BY DATE(created_at) ORDER BY date ASC
  `);

  const topTeams = await query(`
    SELECT t.name, t.logo,
           COUNT(CASE WHEN m.home_team_id = t.id THEN 1 END) +
           COUNT(CASE WHEN m.away_team_id = t.id THEN 1 END) as match_count
    FROM teams t
    LEFT JOIN matches m ON m.home_team_id = t.id OR m.away_team_id = t.id
    GROUP BY t.id ORDER BY match_count DESC LIMIT 5
  `);

  res.json({ success: true, data: { ...totals, userGrowth, topTeams } });
});

// Match management
router.post('/sync-matches', async (_req: Request, res: Response) => {
  await syncMatches();
  res.json({ success: true, message: 'Match sync triggered' });
});

router.post('/sync-results', async (_req: Request, res: Response) => {
  await syncResults();
  res.json({ success: true, message: 'Results sync triggered' });
});

router.post('/process-match/:id', async (req: Request, res: Response) => {
  await processMatchResults(req.params.id);
  res.json({ success: true, message: 'Match results processed' });
});

// Announcements
router.get('/announcements', async (_req: Request, res: Response) => {
  const items = await query('SELECT * FROM announcements ORDER BY priority DESC, created_at DESC');
  res.json({ success: true, data: items });
});

router.post('/announcements', async (req: AuthRequest, res: Response) => {
  const { title, titleAr, content, contentAr, priority, expiresAt } = req.body;
  const [item] = await query(
    `INSERT INTO announcements (title, title_ar, content, content_ar, priority, expires_at, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [title, titleAr, content, contentAr, priority || 0, expiresAt, req.user!.id]
  );
  res.json({ success: true, data: item });
});

router.delete('/announcements/:id', async (req: Request, res: Response) => {
  await query('DELETE FROM announcements WHERE id = $1', [req.params.id]);
  res.json({ success: true });
});

// Broadcast notification
router.post('/notify', async (req: Request, res: Response) => {
  const { title, titleAr, message, messageAr, type = 'announcement' } = req.body;
  await broadcastNotification({ type, title, titleAr, message, messageAr });
  res.json({ success: true, message: 'Notification sent to all users' });
});

// Admin logs
router.get('/logs', async (req: Request, res: Response) => {
  const { page = '1', limit = '50' } = req.query;
  const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

  const logs = await query(
    `SELECT al.*, u.username as admin_username
     FROM admin_logs al
     JOIN users u ON al.admin_id = u.id
     ORDER BY al.created_at DESC
     LIMIT $1 OFFSET $2`,
    [parseInt(limit as string), offset]
  );

  res.json({ success: true, data: logs });
});

export default router;
