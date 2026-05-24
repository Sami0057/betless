import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate, requireAdmin } from '../middleware/auth';
import {
  getMatches, getTodayMatches, getMatch, getMatchWithUserPrediction,
  getUpcomingMatches, createMatch, updateMatch,
} from '../controllers/matches.controller';

const router = Router();

router.get('/', getMatches);
router.get('/today', getTodayMatches);
router.get('/upcoming', getUpcomingMatches);
router.get('/:id', getMatch);
router.get('/:id/prediction', authenticate, getMatchWithUserPrediction);

// Admin routes
router.post('/',
  authenticate,
  requireAdmin,
  [
    body('homeTeamId').isUUID(),
    body('awayTeamId').isUUID(),
    body('matchDate').isDate(),
    body('kickoffTime').isISO8601(),
  ],
  validate,
  createMatch
);

router.put('/:id',
  authenticate,
  requireAdmin,
  updateMatch
);

export default router;
