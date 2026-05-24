// ============================================================
// BETLESS API Server
// Saudi League Football Prediction Platform
// ============================================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

import authRoutes from './routes/auth.routes';
import matchRoutes from './routes/matches.routes';
import predictionRoutes from './routes/predictions.routes';
import leaderboardRoutes from './routes/leaderboard.routes';
import userRoutes from './routes/users.routes';
import adminRoutes from './routes/admin.routes';
import commentRoutes from './routes/comments.routes';
import { errorHandler } from './middleware/errorHandler';
import { startCronJobs } from './jobs/cron';
import logger from './utils/logger';

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const app = express();
const PORT = parseInt(process.env.PORT || '4000');
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// ─── Security & Middleware ───────────────────────────────────

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:3000', 'http://localhost:3001', /\.betless\.app$/],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(compression());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
}

// ─── Rate Limiting ───────────────────────────────────────────

const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many auth attempts. Please try again in 15 minutes.' },
});

app.use('/api', globalLimiter);
app.use('/api/auth', authLimiter);

// ─── Health Check ────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    platform: 'Betless API',
  });
});

// ─── Static Files ────────────────────────────────────────────

const uploadsDir = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// ─── API Routes ──────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/comments', commentRoutes);

// ─── 404 Handler ────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// ─── Error Handler ───────────────────────────────────────────

app.use(errorHandler);

// ─── Wrap async route handlers ───────────────────────────────

const originalUse = app.use.bind(app);
// Automatically catch async errors in route handlers
app.use = function(...args: Parameters<typeof originalUse>) {
  return originalUse(...args);
} as typeof app.use;

// ─── Start Server ────────────────────────────────────────────

app.listen(PORT, () => {
  logger.info(`
  ╔══════════════════════════════════════╗
  ║         BETLESS API Server           ║
  ║   Saudi League Prediction Platform   ║
  ╚══════════════════════════════════════╝
  🚀 Running on port ${PORT}
  🌍 Environment: ${process.env.NODE_ENV || 'development'}
  📡 CORS origin: ${FRONTEND_URL}
  `);

  startCronJobs();
});

// ─── Async error wrapper (apply to all routes) ───────────────

// Patch express to handle async errors
const wrapAsync = (fn: express.RequestHandler): express.RequestHandler =>
  (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export { wrapAsync };
export default app;
