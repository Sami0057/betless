-- ============================================================
-- BETLESS - PostgreSQL Database Schema
-- Saudi League Football Prediction Platform
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ─── ENUMS ──────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');
CREATE TYPE rank_title AS ENUM (
  'Newcomer',
  'Rookie Analyst',
  'Bronze Expert',
  'Silver Strategist',
  'Gold Analyst',
  'Elite Predictor',
  'Master Forecaster',
  'Legend'
);
CREATE TYPE match_status AS ENUM ('scheduled', 'live', 'finished', 'postponed', 'cancelled');
CREATE TYPE prediction_outcome AS ENUM ('home', 'draw', 'away');
CREATE TYPE prediction_status AS ENUM ('pending', 'correct', 'incorrect');
CREATE TYPE badge_rarity AS ENUM ('common', 'rare', 'epic', 'legendary');
CREATE TYPE notification_type AS ENUM (
  'match_starting',
  'prediction_result',
  'rank_upgrade',
  'badge_earned',
  'announcement',
  'streak_milestone'
);
CREATE TYPE language_pref AS ENUM ('en', 'ar');

-- ─── TEAMS TABLE ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS teams (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id   VARCHAR(50) UNIQUE,
  name          VARCHAR(100) NOT NULL,
  name_ar       VARCHAR(100),
  short_name    VARCHAR(20) NOT NULL,
  logo          TEXT,
  primary_color VARCHAR(7) DEFAULT '#1a1a2e',
  secondary_color VARCHAR(7),
  stadium       VARCHAR(200),
  founded       INTEGER,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── USERS TABLE ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username              VARCHAR(30) UNIQUE NOT NULL,
  email                 VARCHAR(255) UNIQUE NOT NULL,
  password_hash         VARCHAR(255),
  avatar_url            TEXT,
  role                  user_role DEFAULT 'user',
  rank_title            rank_title DEFAULT 'Newcomer',
  total_points          INTEGER DEFAULT 0,
  total_predictions     INTEGER DEFAULT 0,
  correct_predictions   INTEGER DEFAULT 0,
  current_streak        INTEGER DEFAULT 0,
  longest_streak        INTEGER DEFAULT 0,
  favorite_team_id      UUID REFERENCES teams(id) ON DELETE SET NULL,
  is_verified           BOOLEAN DEFAULT FALSE,
  is_banned             BOOLEAN DEFAULT FALSE,
  ban_reason            TEXT,
  language              language_pref DEFAULT 'en',
  firebase_uid          VARCHAR(128) UNIQUE,
  refresh_token         TEXT,
  email_verify_token    VARCHAR(255),
  reset_password_token  VARCHAR(255),
  reset_token_expires   TIMESTAMPTZ,
  last_login            TIMESTAMPTZ,
  device_tokens         TEXT[],
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_total_points ON users(total_points DESC);
CREATE INDEX idx_users_current_streak ON users(current_streak DESC);

-- ─── SEASONS TABLE ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS seasons (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(50) NOT NULL,
  year        INTEGER NOT NULL,
  is_active   BOOLEAN DEFAULT FALSE,
  start_date  DATE,
  end_date    DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── MATCHES TABLE ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS matches (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id             VARCHAR(50) UNIQUE,
  home_team_id            UUID NOT NULL REFERENCES teams(id),
  away_team_id            UUID NOT NULL REFERENCES teams(id),
  season_id               UUID REFERENCES seasons(id),
  match_date              DATE NOT NULL,
  kickoff_time            TIMESTAMPTZ NOT NULL,
  status                  match_status DEFAULT 'scheduled',
  round                   INTEGER,
  venue                   VARCHAR(200),
  home_score              INTEGER,
  away_score              INTEGER,
  result                  prediction_outcome,
  home_predict_pct        DECIMAL(5,2) DEFAULT 0,
  draw_predict_pct        DECIMAL(5,2) DEFAULT 0,
  away_predict_pct        DECIMAL(5,2) DEFAULT 0,
  total_predictions       INTEGER DEFAULT 0,
  is_featured             BOOLEAN DEFAULT FALSE,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_kickoff ON matches(kickoff_time);

-- ─── PREDICTIONS TABLE ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS predictions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_id        UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  prediction      prediction_outcome NOT NULL,
  status          prediction_status DEFAULT 'pending',
  points_earned   INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, match_id)
);

CREATE INDEX idx_predictions_user ON predictions(user_id);
CREATE INDEX idx_predictions_match ON predictions(match_id);
CREATE INDEX idx_predictions_status ON predictions(status);

-- ─── BADGES TABLE ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS badges (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              VARCHAR(100) NOT NULL,
  name_ar           VARCHAR(100),
  description       TEXT NOT NULL,
  description_ar    TEXT,
  icon              VARCHAR(10) NOT NULL,
  rarity            badge_rarity DEFAULT 'common',
  requirement_type  VARCHAR(50) NOT NULL,
  requirement_value INTEGER,
  team_id           UUID REFERENCES teams(id) ON DELETE SET NULL,
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─── USER BADGES TABLE ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_badges (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id    UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user ON user_badges(user_id);

-- ─── LEADERBOARD SNAPSHOTS ──────────────────────────────────

CREATE TABLE IF NOT EXISTS leaderboard_snapshots (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period      VARCHAR(20) NOT NULL,
  period_key  VARCHAR(20) NOT NULL,
  points      INTEGER DEFAULT 0,
  rank_pos    INTEGER,
  correct     INTEGER DEFAULT 0,
  total       INTEGER DEFAULT 0,
  streak      INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, period, period_key)
);

CREATE INDEX idx_leaderboard_period ON leaderboard_snapshots(period, period_key, points DESC);

-- ─── NOTIFICATIONS TABLE ────────────────────────────────────

CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        notification_type NOT NULL,
  title       VARCHAR(200) NOT NULL,
  title_ar    VARCHAR(200),
  message     TEXT NOT NULL,
  message_ar  TEXT,
  is_read     BOOLEAN DEFAULT FALSE,
  metadata    JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

-- ─── COMMENTS TABLE ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS comments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id    UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  emoji       VARCHAR(10),
  likes       INTEGER DEFAULT 0,
  is_deleted  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_match ON comments(match_id, created_at DESC);

-- ─── ANNOUNCEMENTS TABLE ────────────────────────────────────

CREATE TABLE IF NOT EXISTS announcements (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       VARCHAR(200) NOT NULL,
  title_ar    VARCHAR(200),
  content     TEXT NOT NULL,
  content_ar  TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  priority    INTEGER DEFAULT 0,
  expires_at  TIMESTAMPTZ,
  created_by  UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ADMIN LOGS TABLE ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS admin_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id    UUID NOT NULL REFERENCES users(id),
  action      VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id   UUID,
  details     JSONB,
  ip_address  VARCHAR(45),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_logs_admin ON admin_logs(admin_id, created_at DESC);

-- ─── UPDATED_AT TRIGGER ─────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_predictions_updated_at BEFORE UPDATE ON predictions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
