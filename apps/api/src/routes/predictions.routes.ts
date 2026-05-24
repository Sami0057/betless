import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import {
  submitPrediction, updatePrediction, getUserPredictions,
} from '../controllers/predictions.controller';

const router = Router();

router.use(authenticate);

router.post('/',
  [body('matchId').isUUID(), body('prediction').isIn(['home', 'draw', 'away'])],
  validate,
  submitPrediction
);
router.put('/:matchId',
  [body('prediction').isIn(['home', 'draw', 'away'])],
  validate,
  updatePrediction
);
router.get('/my', getUserPredictions);

export default router;
