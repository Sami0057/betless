import { Request, Response } from 'express';
import { query, queryOne } from '../db/client';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export async function getMatches(req: Request, res: Response): Promise<void> {
  const { date, status, page = '1', limit = '20' } = req.query;
  const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

  let whereClause = 'WHERE 1=1';
  const params: unknown[] = [];

  if (date) {
    params.push(date);
    whereClause += ` AND m.match_date = $${params.length}`;
  }
  if (status) {
    params.push(status);
    whereClause += ` AND m.status = $${params.length}`;
  }

  params.push(parseInt(limit as string));
  params.push(offset);

  const matches = await query(
    `SELECT m.*,
            ht.id as home_team_id, ht.name as home_team_name, ht.name_ar as home_team_name_ar,
            ht.short_name as home_team_short, ht.logo as home_team_logo, ht.primary_color as home_team_color,
            at.id as away_team_id, at.name as away_team_name, at.name_ar as away_team_name_ar,
            at.short_name as away_team_short, at.logo as away_team_logo, at.primary_color as away_team_color
     FROM matches m
     JOIN teams ht ON m.home_team_id = ht.id
     JOIN teams at ON m.away_team_id = at.id
     ${whereClause}
     ORDER BY m.kickoff_time ASC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  const [{ total }] = await query<{ total: string }>(
    `SELECT COUNT(*) as total FROM matches m ${whereClause.replace(`LIMIT $${params.length - 1} OFFSET $${params.length}`, '')}`,
    params.slice(0, -2)
  );

  res.json({
    success: true,
    data: matches.map(formatMatch),
    total: parseInt(total),
    page: parseInt(page as string),
    limit: parseInt(limit as string),
  });
}

export async function getTodayMatches(_req: Request, res: Response): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const matches = await query(
    `SELECT m.*,
            ht.id as home_team_id, ht.name as home_team_name, ht.name_ar as home_team_name_ar,
            ht.short_name as home_team_short, ht.logo as home_team_logo, ht.primary_color as home_team_color,
            at.id as away_team_id, at.name as away_team_name, at.name_ar as away_team_name_ar,
            at.short_name as away_team_short, at.logo as away_team_logo, at.primary_color as away_team_color
     FROM matches m
     JOIN teams ht ON m.home_team_id = ht.id
     JOIN teams at ON m.away_team_id = at.id
     WHERE m.match_date = $1 AND m.status IN ('scheduled', 'live')
     ORDER BY m.kickoff_time ASC`,
    [today]
  );

  res.json({ success: true, data: matches.map(formatMatch) });
}

export async function getMatch(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const match = await queryOne(
    `SELECT m.*,
            ht.id as home_team_id, ht.name as home_team_name, ht.name_ar as home_team_name_ar,
            ht.short_name as home_team_short, ht.logo as home_team_logo, ht.primary_color as home_team_color,
            ht.stadium as home_stadium,
            at.id as away_team_id, at.name as away_team_name, at.name_ar as away_team_name_ar,
            at.short_name as away_team_short, at.logo as away_team_logo, at.primary_color as away_team_color
     FROM matches m
     JOIN teams ht ON m.home_team_id = ht.id
     JOIN teams at ON m.away_team_id = at.id
     WHERE m.id = $1`,
    [id]
  );

  if (!match) throw new AppError('Match not found', 404);
  res.json({ success: true, data: formatMatch(match as Record<string, unknown>) });
}

export async function getMatchWithUserPrediction(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;

  const [match, prediction] = await Promise.all([
    queryOne(
      `SELECT m.*,
              ht.id as home_team_id, ht.name as home_team_name, ht.name_ar as home_team_name_ar,
              ht.short_name as home_team_short, ht.logo as home_team_logo, ht.primary_color as home_team_color,
              at.id as away_team_id, at.name as away_team_name, at.name_ar as away_team_name_ar,
              at.short_name as away_team_short, at.logo as away_team_logo, at.primary_color as away_team_color
       FROM matches m
       JOIN teams ht ON m.home_team_id = ht.id
       JOIN teams at ON m.away_team_id = at.id
       WHERE m.id = $1`,
      [id]
    ),
    req.user
      ? queryOne(
          'SELECT * FROM predictions WHERE user_id = $1 AND match_id = $2',
          [req.user.id, id]
        )
      : null,
  ]);

  if (!match) throw new AppError('Match not found', 404);

  res.json({
    success: true,
    data: { match: formatMatch(match as Record<string, unknown>), userPrediction: prediction || null },
  });
}

export async function getUpcomingMatches(_req: Request, res: Response): Promise<void> {
  const now = new Date().toISOString();
  const matches = await query(
    `SELECT m.*,
            ht.id as home_team_id, ht.name as home_team_name, ht.short_name as home_team_short,
            ht.logo as home_team_logo, ht.primary_color as home_team_color,
            at.id as away_team_id, at.name as away_team_name, at.short_name as away_team_short,
            at.logo as away_team_logo, at.primary_color as away_team_color
     FROM matches m
     JOIN teams ht ON m.home_team_id = ht.id
     JOIN teams at ON m.away_team_id = at.id
     WHERE m.kickoff_time > $1 AND m.status = 'scheduled'
     ORDER BY m.kickoff_time ASC
     LIMIT 10`,
    [now]
  );

  res.json({ success: true, data: matches.map(formatMatch) });
}

// Admin only
export async function createMatch(req: AuthRequest, res: Response): Promise<void> {
  const { homeTeamId, awayTeamId, matchDate, kickoffTime, round, venue, seasonId } = req.body;

  const [match] = await query(
    `INSERT INTO matches (home_team_id, away_team_id, match_date, kickoff_time, round, venue, season_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [homeTeamId, awayTeamId, matchDate, kickoffTime, round, venue, seasonId]
  );

  res.status(201).json({ success: true, data: match });
}

export async function updateMatch(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const { homeScore, awayScore, status } = req.body;

  let result: string | null = null;
  if (typeof homeScore === 'number' && typeof awayScore === 'number') {
    if (homeScore > awayScore) result = 'home';
    else if (awayScore > homeScore) result = 'away';
    else result = 'draw';
  }

  const [match] = await query(
    `UPDATE matches SET
       home_score = COALESCE($1, home_score),
       away_score = COALESCE($2, away_score),
       status = COALESCE($3, status),
       result = COALESCE($4, result),
       updated_at = NOW()
     WHERE id = $5
     RETURNING *`,
    [homeScore, awayScore, status, result, id]
  );

  if (!match) throw new AppError('Match not found', 404);
  res.json({ success: true, data: match });
}

function formatMatch(row: Record<string, unknown>) {
  return {
    id: row.id,
    matchDate: row.match_date,
    kickoffTime: row.kickoff_time,
    status: row.status,
    round: row.round,
    venue: row.venue,
    homeScore: row.home_score,
    awayScore: row.away_score,
    result: row.result,
    homePredictPct: row.home_predict_pct,
    drawPredictPct: row.draw_predict_pct,
    awayPredictPct: row.away_predict_pct,
    totalPredictions: row.total_predictions,
    isFeatured: row.is_featured,
    homeTeam: {
      id: row.home_team_id,
      name: row.home_team_name,
      nameAr: row.home_team_name_ar,
      shortName: row.home_team_short,
      logo: row.home_team_logo,
      primaryColor: row.home_team_color,
    },
    awayTeam: {
      id: row.away_team_id,
      name: row.away_team_name,
      nameAr: row.away_team_name_ar,
      shortName: row.away_team_short,
      logo: row.away_team_logo,
      primaryColor: row.away_team_color,
    },
  };
}
