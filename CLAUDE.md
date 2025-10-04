# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-powered emotion detection and wellness tracking system with real-time facial analysis, mood journaling, and personalized AI insights. Uses webcam-based facial emotion recognition with TensorFlow.js/face-api.js on the frontend and Node.js backend with SQLite database.

## Architecture

### Stack Components

**Backend** (`backend/`):
- Node.js + Express with ES modules (`type: "module"`)
- SQLite with better-sqlite3 (WAL mode enabled)
- WebSocket server (ws) for real-time emotion streaming at `/ws` path
- JWT authentication with bcryptjs
- Winston for structured logging to `logs/`
- Multer for journal photo uploads to `uploads/journal/`

**Frontend** (`react-frontend/`):
- React 18 + Vite (NOT Next.js, despite README claiming Next.js 14)
- TensorFlow.js + face-api.js for browser-based emotion detection
- React Router for navigation
- Context API for state (AuthContext, EmotionContext, WebSocketContext, ThemeContext)
- Chart.js for analytics visualization
- Tailwind CSS + Framer Motion for UI
- PWA support with vite-plugin-pwa and workbox

### Key Services

**Backend Services** (`backend/src/services/`):
- `EmotionAnalyzer.js`: Core emotion analysis algorithms (stress calculation, wellness scoring, pattern detection)
- `AIInsightService.js`: OpenAI/Anthropic API integration for insights
- `AdvancedAIService.js`: Pattern analysis, mood prediction, daily reports
- `EmotionCoach.js`: Real-time coaching with breathing exercises and interventions
- `MeetingMode.js`: Meeting-specific emotion tracking
- `SmartNotificationSystem.js`: Intelligent notification system
- `AnalyticsService.js`: Data aggregation and reporting
- `NotificationService.js`: n8n webhook integration

**Frontend Face Detection** (`react-frontend/src/utils/faceDetection.js`):
- Loads face-api.js models from `/models` directory
- Uses TinyFaceDetector for performance
- Calculates Eye Aspect Ratio (EAR) for blink detection
- Returns emotions, landmarks, and detection data

### WebSocket Communication

WebSocket server at `ws://localhost:5000/ws` handles:
- Client authentication via `{ type: 'auth', userId }` messages
- Emotion updates broadcast to all sessions of same user
- Real-time emotion streaming during detection sessions
- Session ID assignment on connection

Clients maintained in Map with structure: `{ ws, sessionId, userId }`

### Database Schema

Three main tables in SQLite (`emotion_detection.db`):

1. **users**: id, username, email, password_hash, preferences (JSON), created_at
2. **emotion_readings**: id, user_id, timestamp, emotions (JSON), dominant_emotion, blink_count, stress_level, wellness_score, ai_insight, recommendations (JSON), session_id
3. **mood_journal**: id, user_id, date, mood_rating (1-10), journal_text, ai_analysis, tags (JSON), photo_path

## Development Commands

### Backend
```bash
cd backend
npm install              # Install dependencies
npm run dev              # Start with nodemon (auto-reload)
npm start                # Production start
npm run init-db          # Initialize database schema
```

### Frontend
```bash
cd react-frontend
npm install              # Install dependencies
npm run dev              # Start Vite dev server (default: http://localhost:5173)
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
```

### Docker
```bash
docker-compose up -d     # Start both services
docker-compose logs -f   # View logs
docker-compose down      # Stop services
```

## Configuration

### Environment Variables

**Backend** (`.env`):
- `JWT_SECRET` (required): Secret for JWT token signing
- `PORT` (default: 5000): Server port
- `AI_PROVIDER`: "openai" or "anthropic"
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`: For AI insights (optional)
- `N8N_WEBHOOK_URL`: For webhook notifications (optional)
- `CORS_ORIGIN` (default: http://localhost:3000): Frontend URL

**Frontend** (`.env.local`):
- `NEXT_PUBLIC_API_URL` (default: http://localhost:5000): Backend API URL
- `NEXT_PUBLIC_WS_URL` (default: ws://localhost:5000/ws): WebSocket URL

Note: Frontend uses Vite, not Next.js, so `NEXT_PUBLIC_*` prefix is misleading but maintained for compatibility.

## API Routes

All routes under `/api` prefix with rate limiting applied.

### Main Route Groups
- `/api/auth`: register, login (auth.js)
- `/api/emotions`: record, history/:timeframe, session/:sessionId (emotions.js)
- `/api/analytics`: dashboard, report (analytics.js)
- `/api/ai`: analyze-emotion, analyze-journal (ai.js)
- `/api/journal`: entry (POST/GET), entry/:date (journal.js)
- `/api/advanced`: pattern-analysis, daily-report, patterns/weekly, predict-mood, coach/* (advanced.js)
- `/webhook`: emotion-analysis, user-summary (webhook.js - no auth required)

Health check at `/health`

## Important Implementation Details

### Emotion Analysis Flow
1. Frontend captures video frame with face-api.js
2. Detects face expressions + landmarks + blink rate (EAR calculation)
3. Sends emotion data to backend via POST `/api/emotions/record`
4. Backend runs through EmotionAnalyzer:
   - Calculates dominant emotion
   - Computes stress level (based on negative emotions + abnormal blink rate)
   - Computes wellness score (positive emotions - negative emotions + stress factor)
5. Optionally gets AI insight from AIInsightService
6. Stores in emotion_readings table
7. Broadcasts update via WebSocket to all user's connected clients

### Authentication
- JWT tokens stored in localStorage on frontend
- `auth` middleware (`backend/src/middleware/auth.js`) validates JWT on protected routes
- Token passed via Authorization header: `Bearer <token>`
- User ID extracted from token payload

### File Uploads
- Journal photos uploaded via multer to `uploads/journal/`
- Served as static files via `/uploads` route
- Photo path stored in mood_journal table

### Logging
- Winston logger configured in `backend/src/utils/logger.js`
- Logs to console + `logs/` directory
- Includes request logging middleware in server.js

## Common Development Patterns

### Adding New Emotion Analysis Feature
1. Add calculation logic to `EmotionAnalyzer` class
2. Update emotion_readings table schema if needed (via init-db script)
3. Modify `/api/emotions/record` endpoint to use new calculation
4. Update frontend EmotionContext to display new data

### Adding New AI Feature
1. Create service in `backend/src/services/`
2. Add route in `backend/src/routes/advanced.js` or create new route file
3. Import and register route in `server.js`
4. Add frontend API call in `react-frontend/src/utils/api.js`
5. Create React component to display results

### Database Queries
- Database queries centralized in `backend/src/models/queries.js`
- Use prepared statements for all queries (SQL injection prevention)
- Always use try-catch for database operations
- Log errors via Winston logger

## Testing Workflow

1. Start backend first: `cd backend && npm run dev`
2. Verify backend health: `curl http://localhost:5000/health`
3. Start frontend: `cd react-frontend && npm run dev`
4. Register test user at frontend URL
5. Test emotion detection: allow webcam, click "Start Detection"
6. Verify WebSocket connection in browser DevTools Network tab
7. Check backend logs in `logs/` for any errors

## Browser Compatibility

- Chrome/Edge recommended (best TensorFlow.js performance)
- Requires webcam permissions
- Requires localhost or HTTPS for webcam access
- Safari has limited TensorFlow.js support

## Known Issues

- Frontend package.json references "Next.js" but actually uses Vite
- Environment variable prefix `NEXT_PUBLIC_*` is misleading but functional with Vite
- SQLite database can lock under high concurrent writes (uses WAL mode to mitigate)
- Face detection requires good lighting conditions
- Emotion detection accuracy varies by individual and expression intensity
