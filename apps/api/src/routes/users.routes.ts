import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import {
  getProfile, updateProfile, getUserStats,
  getAllUsers, banUser, unbanUser,
} from '../controllers/users.controller';
import { getUserBadges, getAllBadges } from '../services/badges.service';
import { getUserNotifications, markAsRead } from '../services/notifications.service';
import { AuthRequest } from '../middleware/auth';
import { Response } from 'express';

const router = Router();

// Public
router.get('/profile/:username', getProfile);
router.get('/badges/all', getAllBadges.bind(null) as never);

// Authenticated
router.get('/me/stats', authenticate, getUserStats);
router.put('/me', authenticate, updateProfile);

router.get('/me/badges', authenticate, async (req: AuthRequest, res: Response) => {
  const badges = await getUserBadges(req.user!.id);
  res.json({ success: true, data: badges });
});

router.get('/me/notifications', authenticate, async (req: AuthRequest, res: Response) => {
  const notifications = await getUserNotifications(req.user!.id);
  res.json({ success: true, data: notifications });
});

router.post('/me/notifications/read', authenticate, async (req: AuthRequest, res: Response) => {
  await markAsRead(req.user!.id, req.body.notificationId);
  res.json({ success: true });
});

// Admin
router.get('/admin/list', authenticate, requireAdmin, getAllUsers);
router.post('/admin/:id/ban', authenticate, requireAdmin, banUser);
router.post('/admin/:id/unban', authenticate, requireAdmin, unbanUser);

export default router;
