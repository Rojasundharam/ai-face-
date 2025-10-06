# AI Emotion Detection - Next.js Edition

AI-powered emotion detection and wellness tracking system built with Next.js 14, featuring real-time facial analysis, mood journaling, and personalized AI insights.

## Features

- 🎭 Real-time emotion detection using TensorFlow.js and face-api.js
- 📊 Advanced analytics and pattern recognition
- 📝 AI-powered mood journaling
- 🔐 JWT authentication
- ⚡ WebSocket support for real-time updates
- 📱 Responsive design with Tailwind CSS
- 🌓 Dark mode support

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TensorFlow.js, face-api.js
- **Backend**: Next.js API Routes, Custom Node.js Server
- **Database**: SQLite with better-sqlite3
- **Authentication**: JWT with bcryptjs
- **Real-time**: WebSocket (ws)
- **UI**: Tailwind CSS, Framer Motion, Chart.js
- **AI**: OpenAI/Anthropic API integration

## Installation

### Prerequisites

- Node.js 18+ installed
- Webcam for emotion detection

### Setup Steps

1. **Clone and navigate to the project**:
   ```bash
   cd nextjs-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   - Copy `.env.local` and update the values
   - Set your `JWT_SECRET`
   - Add API keys for OpenAI or Anthropic (optional for AI insights)

4. **Initialize the database**:
   ```bash
   npm run init-db
   ```

5. **Download face-api.js models**:
   - Place models in `public/models/` directory
   - Required models: tiny_face_detector, face_landmark_68, face_expression

6. **Run development server**:
   ```bash
   npm run dev
   ```

7. **Access the application**:
   - Open http://localhost:3000
   - Register a new account
   - Allow webcam permissions

## Scripts

- `npm run dev` - Start development server with WebSocket support
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run init-db` - Initialize SQLite database

## Project Structure

```
nextjs-app/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── emotions/        # Emotion tracking endpoints
│   │   ├── analytics/       # Analytics endpoints
│   │   ├── ai/              # AI analysis endpoints
│   │   ├── journal/         # Journal endpoints
│   │   ├── advanced/        # Advanced features
│   │   └── webhook/         # Webhook endpoints
│   ├── analytics/           # Analytics page
│   ├── journal/             # Journal page
│   ├── settings/            # Settings page
│   ├── layout.jsx           # Root layout
│   ├── page.jsx             # Dashboard (home)
│   └── globals.css          # Global styles
├── components/               # React components
│   ├── context/             # Context providers
│   ├── LiveEmotionDetector.jsx
│   ├── EmotionHistory.jsx
│   ├── QuickStats.jsx
│   └── ...
├── lib/                      # Backend code
│   ├── services/            # Business logic services
│   ├── db/                  # Database & queries
│   ├── middleware/          # API middleware
│   └── utils/               # Utilities
├── public/                   # Static files
│   └── models/              # face-api.js models
├── uploads/                  # User uploads
├── logs/                     # Application logs
├── server.js                # Custom server with WebSocket
├── next.config.js           # Next.js configuration
├── tailwind.config.js       # Tailwind configuration
└── package.json             # Dependencies

```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Emotions
- `POST /api/emotions/record` - Record emotion reading
- `GET /api/emotions/history/:timeframe` - Get emotion history
- `GET /api/emotions/session/:sessionId` - Get session emotions

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard data
- `GET /api/analytics/report` - Generate analytics report

### Journal
- `POST /api/journal/entry` - Create journal entry
- `GET /api/journal/entry` - Get journal entries
- `GET /api/journal/entry/:date` - Get entry by date

### AI & Advanced
- `POST /api/ai/analyze-emotion` - AI emotion analysis
- `POST /api/ai/analyze-journal` - AI journal analysis
- `POST /api/advanced/pattern-analysis` - Pattern analysis
- `GET /api/advanced/daily-report` - Daily wellness report

### Webhooks
- `POST /api/webhook/emotion-analysis` - Webhook for emotion analysis
- `POST /api/webhook/user-summary` - Webhook for user summary

## WebSocket Events

Connect to `ws://localhost:3000/ws`

### Client → Server
- `{ type: 'auth', userId }` - Authenticate WebSocket connection
- `{ type: 'emotion_update', emotion }` - Broadcast emotion update

### Server → Client
- `{ type: 'auth_success', sessionId }` - Authentication successful
- `{ type: 'emotion_update', data, timestamp }` - Real-time emotion update
- `{ type: 'error', message }` - Error message

## Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# AI Provider
AI_PROVIDER=openai
OPENAI_API_KEY=your-api-key

# Next.js (Public)
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000/ws
```

## Database Schema

### users
- id, username, email, password_hash, preferences, created_at

### emotion_readings
- id, user_id, timestamp, emotions, dominant_emotion, blink_count
- stress_level, wellness_score, ai_insight, recommendations, session_id

### mood_journal
- id, user_id, date, mood_rating, journal_text, ai_analysis, tags, photo_path

## Development Notes

### Custom Server
This app uses a custom Next.js server (`server.js`) to integrate WebSocket support. The server:
- Handles Next.js requests
- Manages WebSocket connections
- Serves static files from `/uploads`

### Client Components
Most components use the `'use client'` directive due to:
- TensorFlow.js/face-api.js (browser-only)
- WebSocket connections
- Real-time state management
- Interactive features

### SQLite Configuration
- better-sqlite3 requires native compilation
- Configured as webpack external in `next.config.js`
- Database runs in WAL mode for better concurrency

## Troubleshooting

### WebSocket Connection Issues
- Ensure custom server is running (`npm run dev`)
- Check firewall settings
- Verify `NEXT_PUBLIC_WS_URL` in `.env.local`

### Face Detection Not Working
- Download face-api.js models to `public/models/`
- Allow webcam permissions in browser
- Use HTTPS or localhost
- Check browser console for errors

### Database Errors
- Run `npm run init-db` to create tables
- Check file permissions on `.db` files
- Ensure SQLite is not locked by another process

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node.js version (18+)

## Migration from Separate Backend/Frontend

This app consolidates a separate Express backend and Vite frontend into a single Next.js codebase:

- Express routes → Next.js API routes
- React Router → Next.js App Router
- Vite → Next.js built-in bundler
- Separate servers → Single custom server with WebSocket

## License

MIT

## Support

For issues and questions:
- Check the troubleshooting section
- Review the code documentation
- Check browser console for errors
