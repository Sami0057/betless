import { Router, Response } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate, AuthRequest } from '../middleware/auth';
import { query } from '../db/client';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/match/:matchId', async (req, res) => {
  const comments = await query(
    `SELECT c.id, c.content, c.emoji, c.likes, c.created_at,
            u.username, u.avatar_url, u.rank_title
     FROM comments c
     JOIN users u ON c.user_id = u.id
     WHERE c.match_id = $1 AND c.is_deleted = false
     ORDER BY c.created_at DESC
     LIMIT 50`,
    [req.params.matchId]
  );
  res.json({ success: true, data: comments });
});

router.post('/match/:matchId',
  authenticate,
  [body('content').isLength({ min: 1, max: 500 }), body('emoji').optional().isLength({ max: 10 })],
  validate,
  async (req: AuthRequest, res: Response) => {
    const { content, emoji } = req.body;
    const [comment] = await query(
      `INSERT INTO comments (id, match_id, user_id, content, emoji)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [uuidv4(), req.params.matchId, req.user!.id, content, emoji]
    );
    res.status(201).json({ success: true, data: comment });
  }
);

router.post('/:id/like', authenticate, async (req: AuthRequest, res: Response) => {
  await query('UPDATE comments SET likes = likes + 1 WHERE id = $1', [req.params.id]);
  res.json({ success: true });
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  await query(
    'UPDATE comments SET is_deleted = true WHERE id = $1 AND user_id = $2',
    [req.params.id, req.user!.id]
  );
  res.json({ success: true });
});

export default router;
