# BETLESS — Saudi League Football Prediction Platform

> Predict Saudi Pro League match results, earn points, climb leaderboards, and unlock achievements. The #1 free football prediction platform for Saudi football fans.

**NOT gambling. NOT betting. NOT casino. Pure skill-based prediction competition.**

---

## Project Structure

```
betless/
├── apps/
│   ├── web/          # Next.js 14 web application
│   ├── api/          # Express.js REST API
│   └── mobile/       # React Native Expo app
├── packages/
│   └── shared/       # Shared TypeScript types
├── docker-compose.yml
└── package.json
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL 16 |
| Auth | JWT + Refresh Tokens |
| Mobile | React Native, Expo SDK 50 |
| State | Zustand |
| Deployment | Vercel (Web), Railway/Render (API), Docker |

---

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 16
- npm or yarn

### 1. Clone and install
```bash
git clone https://github.com/your-org/betless.git
cd betless
npm install
```

### 2. Configure environment
```bash
# API
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your database and API keys

# Web
cp apps/web/.env.example apps/web/.env
# Edit apps/web/.env
```

### 3. Set up database
```bash
# Run migrations
npm run db:migrate

# Seed with Saudi League teams and badges
npm run db:seed
```

### 4. Start development
```bash
# Start API + Web together
npm run dev

# Or separately:
npm run dev:api     # API on port 4000
npm run dev:web     # Web on port 3000
npm run dev:mobile  # Mobile with Expo
```

---

## Production Deployment

### Docker (Recommended)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api
```

### Vercel (Web)
```bash
cd apps/web
npx vercel --prod
```

### Railway/Render (API)
1. Connect your GitHub repository
2. Set environment variables from `.env.example`
3. Deploy automatically on push

### Mobile (Android)
```bash
cd apps/mobile

# Build for Android
eas build --platform android

# Submit to Google Play
eas submit --platform android
```

---

## API Documentation

Base URL: `http://localhost:4000/api`

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login with email/password |
| POST | `/auth/social` | Social login (Google/Apple) |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Logout |
| GET | `/auth/me` | Get current user |

### Matches
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/matches` | Get all matches (paginated) |
| GET | `/matches/today` | Get today's matches |
| GET | `/matches/upcoming` | Get upcoming matches |
| GET | `/matches/:id` | Get single match |

### Predictions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/predictions` | Submit prediction |
| PUT | `/predictions/:matchId` | Update prediction |
| GET | `/predictions/my` | Get user's predictions |

### Leaderboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/leaderboard/global` | All-time leaderboard |
| GET | `/leaderboard/weekly` | Weekly leaderboard |
| GET | `/leaderboard/monthly` | Monthly leaderboard |
| GET | `/leaderboard/streak` | Streak leaderboard |

---

## Default Admin Account
After seeding:
- Email: `admin@betless.app`
- Password: `Admin@Betless2024!`
- ⚠️ Change this immediately in production!

---

## Key Features

### Point System
- ✅ Correct prediction → **+10 points**
- ❌ Wrong prediction → 0 points
- 🔥 Streak bonus → 1.5x multiplier (3+ consecutive correct)

### Rank System
| Rank | Required Wins | Icon |
|------|--------------|------|
| Newcomer | 0 | 🌱 |
| Rookie Analyst | 10 | 📊 |
| Bronze Expert | 20 | 🥉 |
| Silver Strategist | 35 | ⚡ |
| Gold Analyst | 40 | 🥇 |
| Elite Predictor | 60 | 🎯 |
| Master Forecaster | 80 | 🔮 |
| Legend | 100 | 👑 |

### Football API Integration
The platform integrates with **API-Football** (api-sports.io) to fetch:
- Saudi Pro League fixtures (League ID: 307)
- Match results
- Team standings

Set your API key in `apps/api/.env`:
```
FOOTBALL_API_KEY=your_key_here
```

Without an API key, the app uses mock data for development.

---

## Security Features
- JWT access tokens (7d) + refresh tokens (30d)
- Password hashing with bcrypt (12 rounds)
- Rate limiting (100 req/15min globally, 10 req/15min for auth)
- CORS protection
- Helmet security headers
- SQL injection prevention (parameterized queries)
- Input validation (express-validator)
- Admin action logging

---

## Google Play Compliance
- ✅ No gambling mechanics
- ✅ No real-money wagering
- ✅ No casino systems
- ✅ Free to play, no IAPs
- ✅ Privacy Policy included
- ✅ Terms of Service included
- ✅ Content rating: Everyone (13+)
- ✅ User data protection

---

## License
MIT License — See LICENSE file for details.

---

## Contact
- Website: betless.app
- Support: support@betless.app
- Privacy: privacy@betless.app
