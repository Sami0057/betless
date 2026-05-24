import { Response } from 'express';
import { query, queryOne, withTransaction } from '../db/client';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { POINTS_PER_CORRECT_PREDICTION, getRankFromWins } from '../shared';
import { checkAndAwardBadges } from '../services/badges.service';
import { createNotification } from '../services/notifications.service';

export async function submitPrediction(req: AuthRequest, res: Response): Promise<void> {
  const { matchId, prediction } = req.body;
  const userId = req.user!.id;

  const match = await queryOne<{ id: string; status: string; kickoff_time: string }>(
    'SELECT id, status, kickoff_time FROM matches WHERE id = $1',
    [matchId]
  );

  if (!match) throw new AppError('Match not found', 404);
  if (match.status !== 'scheduled') throw new AppError('Match has already started', 400);
  if (new Date(match.kickoff_time) <= new Date()) throw new AppError('Prediction window has closed', 400);

  const existing = await queryOne('SELECT id FROM predictions WHERE user_id = $1 AND match_id = $2', [userId, matchId]);
  if (existing) throw new AppError('Prediction already submitted. Edit instead.', 409);

  const [pred] = await query(
    `INSERT INTO predictions (user_id, match_id, prediction) VALUES ($1, $2, $3) RETURNING *`,
    [userId, matchId, prediction]
  );

  // Update match prediction percentages
  await updateMatchPredictionStats(matchId);

  res.status(201).json({ success: true, data: pred, message: 'Prediction submitted!' });
}

export async function updatePrediction(req: AuthRequest, res: Response): Promise<void> {
  const { matchId } = req.params;
  const { prediction } = req.body;
  const userId = req.user!.id;

  const match = await queryOne<{ id: string; status: string; kickoff_time: string }>(
    'SELECT id, status, kickoff_time FROM matches WHERE id = $1',
    [matchId]
  );

  if (!match) throw new AppError('Match not found', 404);
  if (match.status !== 'scheduled') throw new AppError('Cannot edit after match starts', 400);
  if (new Date(match.kickoff_time) <= new Date()) throw new AppError('Prediction window has closed', 400);

  const [pred] = await query(
    `UPDATE predictions SET prediction = $1, updated_at = NOW()
     WHERE user_id = $2 AND match_id = $3
     RETURNING *`,
    [prediction, userId, matchId]
  );

  if (!pred) throw new AppError('Prediction not found', 404);
  await updateMatchPredictionStats(matchId);

  res.json({ success: true, data: pred });
}

export async function getUserPredictions(req: AuthRequest, res: Response): Promise<void> {
  const { page = '1', limit = '20', status } = req.query;
  const userId = req.user!.id;
  const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

  let whereExtra = '';
  const params: unknown[] = [userId];

  if (status) {
    params.push(status);
    whereExtra = ` AND p.status = $${params.length}`;
  }

  params.push(parseInt(limit as string), offset);

  const predictions = await query(
    `SELECT p.*,
            m.match_date, m.kickoff_time, m.status as match_status,
            m.home_score, m.away_score, m.result,
            ht.name as home_team, ht.logo as home_logo, ht.short_name as home_short,
            at.name as away_team, at.logo as away_logo, at.short_name as away_short
     FROM predictions p
     JOIN matches m ON p.match_id = m.id
     JOIN teams ht ON m.home_team_id = ht.id
     JOIN teams at ON m.away_team_id = at.id
     WHERE p.user_id = $1${whereExtra}
     ORDER BY m.kickoff_time DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  res.json({ success: true, data: predictions });
}

export async function processMatchResults(matchId: string): Promise<void> {
  await withTransaction(async (client) => {
    const match = await client.query(
      'SELECT id, result FROM matches WHERE id = $1 AND status = $2 AND result IS NOT NULL',
      [matchId, 'finished']
    );

    if (!match.rows[0]) return;

    const predictions = await client.query(
      'SELECT * FROM predictions WHERE match_id = $1 AND status = $2',
      [matchId, 'pending']
    );

    for (const pred of predictions.rows) {
      const isCorrect = pred.prediction === match.rows[0].result;
      const points = isCorrect ? POINTS_PER_CORRECT_PREDICTION : 0;

      await client.query(
        'UPDATE predictions SET status = $1, points_earned = $2 WHERE id = $3',
        [isCorrect ? 'correct' : 'incorrect', points, pred.id]
      );

      // Update user stats
      if (isCorrect) {
        await client.query(
          `UPDATE users SET
             total_predictions = total_predictions + 1,
             correct_predictions = correct_predictions + 1,
             current_streak = current_streak + 1,
             longest_streak = GREATEST(longest_streak, current_streak + 1),
             total_points = total_points + $1
           WHERE id = $2`,
          [points, pred.user_id]
        );
      } else {
        await client.query(
          `UPDATE users SET
             total_predictions = total_predictions + 1,
             current_streak = 0
           WHERE id = $1`,
          [pred.user_id]
        );
      }

      // Update rank based on correct predictions
      const userResult = await client.query(
        'SELECT correct_predictions FROM users WHERE id = $1',
        [pred.user_id]
      );
      const newRank = getRankFromWins(userResult.rows[0].correct_predictions);
      await client.query('UPDATE users SET rank_title = $1 WHERE id = $2', [newRank, pred.user_id]);

      // Send notification
      await createNotification(pred.user_id, {
        type: 'prediction_result',
        title: isCorrect ? 'Correct Prediction! 🎯' : 'Better luck next time',
        titleAr: isCorrect ? 'توقع صحيح! 🎯' : 'حظاً أوفر في المرة القادمة',
        message: isCorrect ? `You earned ${points} points!` : 'Your prediction was incorrect',
        messageAr: isCorrect ? `ربحت ${points} نقطة!` : 'توقعك لم يكن صحيحاً',
        metadata: { matchId, points, isCorrect },
      });

      // Check badge eligibility
      await checkAndAwardBadges(pred.user_id);
    }
  });
}

async function updateMatchPredictionStats(matchId: string): Promise<void> {
  const stats = await query<{ prediction: string; count: string }>(
    'SELECT prediction, COUNT(*) as count FROM predictions WHERE match_id = $1 GROUP BY prediction',
    [matchId]
  );

  const total = stats.reduce((sum, s) => sum + parseInt(s.count), 0);
  if (total === 0) return;

  const getPct = (outcome: string) => {
    const s = stats.find((r) => r.prediction === outcome);
    return s ? Math.round((parseInt(s.count) / total) * 100) : 0;
  };

  await query(
    `UPDATE matches SET
       home_predict_pct = $1,
       draw_predict_pct = $2,
       away_predict_pct = $3,
       total_predictions = $4
     WHERE id = $5`,
    [getPct('home'), getPct('draw'), getPct('away'), total, matchId]
  );
}
