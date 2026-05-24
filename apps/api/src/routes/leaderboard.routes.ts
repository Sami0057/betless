import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getGlobalLeaderboard, getWeeklyLeaderboard, getMonthlyLeaderboard,
  getStreakLeaderboard, getUserRank,
} from '../controllers/leaderboard.controller';

const router = Router();

router.get('/global', getGlobalLeaderboard);
router.get('/weekly', getWeeklyLeaderboard);
router.get('/monthly', getMonthlyLeaderboard);
router.get('/streak', getStreakLeaderboard);
router.get('/my-rank', authenticate, getUserRank);

export default router;
