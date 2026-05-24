import axios from 'axios';
import { query, queryOne } from '../db/client';
import logger from '../utils/logger';

const API_KEY = process.env.FOOTBALL_API_KEY;
const BASE_URL = process.env.FOOTBALL_API_BASE_URL || 'https://v3.football.api-sports.io';
const SAUDI_LEAGUE_ID = parseInt(process.env.SAUDI_LEAGUE_ID || '307');

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'x-rapidapi-key': API_KEY,
    'x-rapidapi-host': 'v3.football.api-sports.io',
  },
  timeout: 10000,
});

export async function syncMatches(): Promise<void> {
  if (!API_KEY) {
    logger.warn('Football API key not configured, using mock data');
    await insertMockMatches();
    return;
  }

  try {
    const season = new Date().getFullYear();
    const response = await apiClient.get('/fixtures', {
      params: { league: SAUDI_LEAGUE_ID, season, next: 30 },
    });

    const fixtures = response.data?.response || [];

    for (const fixture of fixtures) {
      const homeTeam = await queryOne<{ id: string }>(
        'SELECT id FROM teams WHERE external_id = $1',
        [fixture.teams.home.id.toString()]
      );
      const awayTeam = await queryOne<{ id: string }>(
        'SELECT id FROM teams WHERE external_id = $1',
        [fixture.teams.away.id.toString()]
      );

      if (!homeTeam || !awayTeam) continue;

      const kickoff = new Date(fixture.fixture.date);

      await query(
        `INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, kickoff_time, venue, round, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (external_id) DO UPDATE SET
           status = EXCLUDED.status,
           kickoff_time = EXCLUDED.kickoff_time`,
        [
          fixture.fixture.id.toString(),
          homeTeam.id,
          awayTeam.id,
          kickoff.toISOString().split('T')[0],
          kickoff.toISOString(),
          fixture.fixture.venue?.name,
          fixture.league.round?.replace('Regular Season - ', '') || null,
          mapStatus(fixture.fixture.status.short),
        ]
      );
    }

    logger.info(`✅ Synced ${fixtures.length} upcoming matches`);
  } catch (error) {
    logger.error('Failed to sync matches from API:', error);
  }
}

export async function syncResults(): Promise<void> {
  if (!API_KEY) return;

  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await apiClient.get('/fixtures', {
      params: { league: SAUDI_LEAGUE_ID, date: today },
    });

    const fixtures = response.data?.response || [];

    for (const fixture of fixtures) {
      const status = mapStatus(fixture.fixture.status.short);
      const homeScore = fixture.goals.home;
      const awayScore = fixture.goals.away;

      let result: string | null = null;
      if (status === 'finished' && homeScore !== null && awayScore !== null) {
        if (homeScore > awayScore) result = 'home';
        else if (awayScore > homeScore) result = 'away';
        else result = 'draw';
      }

      const match = await queryOne<{ id: string; status: string }>(
        'SELECT id, status FROM matches WHERE external_id = $1',
        [fixture.fixture.id.toString()]
      );

      if (!match) continue;

      await query(
        `UPDATE matches SET status = $1, home_score = $2, away_score = $3, result = $4 WHERE external_id = $5`,
        [status, homeScore, awayScore, result, fixture.fixture.id.toString()]
      );

      // Process results if match just finished
      if (status === 'finished' && match.status !== 'finished' && result) {
        const { processMatchResults } = await import('../controllers/predictions.controller');
        await processMatchResults(match.id);
      }
    }
  } catch (error) {
    logger.error('Failed to sync results:', error);
  }
}

function mapStatus(short: string): string {
  const map: Record<string, string> = {
    TBD: 'scheduled', NS: 'scheduled', '1H': 'live', HT: 'live',
    '2H': 'live', ET: 'live', P: 'live', FT: 'finished',
    AET: 'finished', PEN: 'finished', BT: 'live', SUSP: 'postponed',
    INT: 'postponed', PST: 'postponed', CANC: 'cancelled', ABD: 'cancelled',
    AWD: 'finished', WO: 'finished', LIVE: 'live',
  };
  return map[short] || 'scheduled';
}

async function insertMockMatches(): Promise<void> {
  const teams = await query<{ id: string }>('SELECT id FROM teams LIMIT 16');
  if (teams.length < 2) return;

  const today = new Date();
  const matchups = [
    [0, 1], [2, 3], [4, 5], [6, 7],
  ];

  for (let i = 0; i < matchups.length; i++) {
    const [h, a] = matchups[i];
    const matchDate = new Date(today);
    matchDate.setDate(today.getDate() + i * 3);

    const homeId = teams[h]?.id;
    const awayId = teams[a]?.id;
    if (!homeId || !awayId) continue;

    await query(
      `INSERT INTO matches (home_team_id, away_team_id, match_date, kickoff_time, round, status)
       VALUES ($1, $2, $3, $4, $5, 'scheduled')
       ON CONFLICT DO NOTHING`,
      [homeId, awayId, matchDate.toISOString().split('T')[0], matchDate.toISOString(), i + 1]
    ).catch(() => {});
  }
}
