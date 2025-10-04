# Complete AI Emotion Detection System - Guide

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Quick Start](#quick-start)
4. [Core Features](#core-features)
5. [Advanced AI Features](#advanced-ai-features)
6. [API Reference](#api-reference)
7. [Frontend Components](#frontend-components)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

---

## System Overview

A complete, production-ready AI emotion detection and wellness tracking system with:

- **Real-time facial emotion recognition** (7 emotions)
- **Blink detection** using EAR algorithm
- **AI-powered insights** (OpenAI/Anthropic)
- **Pattern detection** and trigger identification
- **Mood prediction** (ML-based)
- **Emotion coaching** with exercises
- **Meeting engagement tracking**
- **Smart notifications** with n8n integration
- **Progressive Web App** (offline support)
- **Glassmorphism UI** with dark mode

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React 18)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ face-api.js  │  │ TensorFlow.js│  │  Chart.js    │  │
│  │ (Emotion)    │  │  (ML Models) │  │  (Viz)       │  │
│  └──────┬───────┘  └──────────────┘  └──────────────┘  │
│         │                                                 │
│         │ WebSocket + REST API                           │
│         ▼                                                 │
│  ┌─────────────────────────────────────────────────┐    │
│  │        Emotion Context + WebSocket Manager      │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                           │
                           │ HTTPS/WSS
                           ▼
┌─────────────────────────────────────────────────────────┐
│                Backend (Node.js + Express)               │
│  ┌──────────────────────────────────────────────────┐  │
│  │                 API Routes                        │  │
│  │  /auth  /emotions  /analytics  /ai  /advanced    │  │
│  └────────────────────┬─────────────────────────────┘  │
│                       │                                  │
│         ┌─────────────┼─────────────┐                   │
│         │             │             │                   │
│         ▼             ▼             ▼                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ Emotion  │  │   AI     │  │ Meeting  │             │
│  │ Analyzer │  │ Service  │  │  Mode    │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│         │             │             │                   │
│         └─────────────┼─────────────┘                   │
│                       │                                  │
│                       ▼                                  │
│              ┌─────────────────┐                        │
│              │ SQLite Database │                        │
│              └─────────────────┘                        │
└─────────────────────────────────────────────────────────┘
                           │
                           │ Webhooks
                           ▼
                     ┌──────────┐
                     │   n8n    │
                     │ Workflows│
                     └──────────┘
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Webcam
- (Optional) OpenAI or Anthropic API key

### Installation

```bash
# Clone repository
git clone <repo-url>
cd emotion-detection-ai

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your API keys
npm run init-db
npm run dev  # Runs on port 5000

# Frontend setup (new terminal)
cd ../frontend
npm install
npm run dev  # Runs on port 3000

# OR React frontend (new terminal)
cd ../react-frontend
npm install
# Download face-api.js models to public/models
npm run dev  # Runs on port 3000
```

### Docker Setup

```bash
# Create .env in root
cp .env.example .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## Core Features

### 1. **Real-time Emotion Detection**

**Technology:** face-api.js + MediaPipe Face Mesh

**Detects:**
- 7 emotions: happy, sad, angry, surprised, fearful, disgusted, neutral
- Blink rate (normal: 15-20/min)
- Stress level (0-100)
- Wellness score (0-100)

**Performance:**
- 10 FPS detection
- <100ms per frame
- Client-side processing (privacy-first)

**Usage:**
```javascript
import LiveEmotionDetector from '@/components/LiveEmotionDetector';

<LiveEmotionDetector />
```

---

### 2. **Analytics & Visualization**

**Charts:**
- Emotion distribution (Doughnut)
- Wellness trends (Line)
- Dominant emotions (Bar)
- Time-series analysis

**Metrics:**
- Today/Week/Month aggregations
- Average stress/wellness
- Most common emotions
- Trend indicators (improving/declining/stable)

**Usage:**
```javascript
import Analytics from '@/pages/Analytics';

<Analytics />
```

---

### 3. **Mood Journal**

**Features:**
- Daily mood rating (1-10)
- Free-text journaling
- Photo uploads
- AI-powered analysis
- Tag system
- Calendar view

**AI Analysis:**
- Sentiment analysis
- Pattern detection in journal entries
- Personalized feedback

**Usage:**
```javascript
import Journal from '@/pages/Journal';

<Journal />
```

---

## Advanced AI Features

### 1. **Emotion Coaching**

Real-time feedback and exercises based on your current emotional state.

**Features:**
- **Breathing Exercises** - 4-7-8 technique for stress
- **Mood Interventions** - Active support for negative emotions
- **Positive Reinforcement** - Celebrate good moments
- **Fatigue Alerts** - Eye strain detection
- **Crisis Assessment** - Risk evaluation with resources

**Example:**
```javascript
POST /api/advanced/coach/feedback
{
  "emotionData": {
    "dominantEmotion": "angry",
    "stressLevel": 85,
    "wellnessScore": 35
  }
}

Response:
{
  "feedback": [{
    "type": "breathing_exercise",
    "priority": "high",
    "message": "High stress detected...",
    "instructions": ["Breathe in for 4s", "Hold for 7s", ...]
  }]
}
```

**Component:**
```jsx
import EmotionCoach from '@/components/EmotionCoach';

<EmotionCoach />
```

---

### 2. **Mood Prediction**

ML-based forecasting of your emotional state.

**Algorithm:**
1. Analyze last 20-100 readings
2. Calculate trend (improving/declining/stable)
3. Apply confidence weighting
4. Generate AI-enhanced prediction

**Accuracy:**
- 2 hours: 70-85% confidence
- 4 hours: 60-75% confidence
- 12 hours: 40-60% confidence

**Example:**
```javascript
POST /api/advanced/predict-mood
{ "hoursAhead": 4 }

Response:
{
  "aiPrediction": "Based on your current wellness trend...",
  "confidence": 72,
  "trend": "improving",
  "advice": "Continue your current wellness practices"
}
```

**Component:**
```jsx
import MoodPrediction from '@/components/MoodPrediction';

<MoodPrediction />
```

---

### 3. **Pattern Detection**

Identifies recurring patterns, triggers, and peak stress times.

**Detects:**
- **Recurring Patterns** - Consecutive similar emotions (3+ times)
- **Triggers** - Sudden stress spikes (>20 points)
- **Peak Times** - High-stress hours of day
- **Severity** - Low/Medium/High risk assessment

**Example:**
```javascript
GET /api/advanced/patterns/weekly

Response:
{
  "recurring": [
    { "emotion": "sad", "count": 7, "startTime": "..." }
  ],
  "triggers": [
    {
      "timestamp": "2024-01-15T14:30:00Z",
      "stressIncrease": "25.3",
      "emotionChange": "neutral → angry"
    }
  ],
  "peakTimes": [
    { "hour": 14, "avgStress": "72.5" }
  ],
  "severity": "medium",
  "recommendations": [...]
}
```

**Component:**
```jsx
import PatternAnalysis from '@/components/PatternAnalysis';

<PatternAnalysis />
```

---

### 4. **Daily Reports**

AI-generated comprehensive wellness summaries.

**Includes:**
- Overall summary (3-4 sentences)
- Highlights (positive moments)
- Lowlights (challenges)
- Recommendations for tomorrow
- Tomorrow's forecast

**Example:**
```javascript
GET /api/advanced/daily-report

Response:
{
  "summary": "Today you had 23 emotion readings...",
  "highlights": [
    "Excellent wellness score during morning hours",
    "Successfully managed stress spike at 2pm"
  ],
  "lowlights": [
    "Elevated stress during afternoon meetings"
  ],
  "recommendations": [
    "Schedule breaks between meetings"
  ],
  "tomorrowForecast": "Expect stable wellness...",
  "stats": { totalReadings: 23, avgWellness: 68.5, ... }
}
```

**Component:**
```jsx
import DailyReport from '@/components/DailyReport';

<DailyReport />
```

---

### 5. **Meeting Mode**

Track engagement and attention during meetings/presentations.

**Metrics:**
- **Engagement Score** (0-100)
  - Attention: 30%
  - Emotional engagement: 30%
  - Stress balance: 20%
  - Participation: 20%

**Features:**
- Real-time insights
- Post-meeting reports
- Emotion timeline
- Recommendations for improvement

**Workflow:**
```javascript
// Start meeting
POST /api/advanced/meeting/start
{ "meetingInfo": { "title": "Team Standup" } }
→ { session: { id: "meeting-123..." } }

// Stream emotions during meeting
POST /api/advanced/meeting/:sessionId/emotion
{ "emotionData": {...} }

// Get live insights
GET /api/advanced/meeting/:sessionId/insights
→ { currentMood: "neutral", avgStress: 45, alerts: [...] }

// End meeting and get report
POST /api/advanced/meeting/:sessionId/end
→ { report: { engagementScore: 72, ... } }
```

---

### 6. **Smart Notifications**

Contextual, intelligent notification delivery.

**Features:**
- **Quiet Hours** - Respect user schedule (e.g., 10pm-7am)
- **Priority Routing** - Critical alerts bypass filters
- **Rate Limiting** - Prevent notification fatigue
- **Multi-Channel** - WebSocket, webhook, email, SMS
- **User Preferences** - Granular control

**Configuration:**
```javascript
POST /api/advanced/notifications/preferences
{
  "preferences": {
    "enabled": true,
    "channels": ["in_app", "webhook"],
    "quietHours": { "start": 22, "end": 7 },
    "frequency": "normal",  // low, normal, high
    "types": {
      "stress_alerts": true,
      "wellness_tips": true,
      "achievements": true,
      "daily_summary": true,
      "crisis_support": true
    }
  }
}
```

**Notification Types:**
- **Stress Alerts** - High stress detected (>70)
- **Wellness Tips** - Periodic suggestions
- **Achievements** - Streak/milestone celebrations
- **Daily Summary** - End-of-day report
- **Crisis Support** - High-risk pattern detected

---

## API Reference

### Authentication

```javascript
POST /api/auth/register
POST /api/auth/login
```

### Emotions

```javascript
POST /api/emotions/record
GET /api/emotions/history/:timeframe
GET /api/emotions/session/:sessionId
```

### Analytics

```javascript
GET /api/analytics/dashboard
GET /api/analytics/report
```

### AI

```javascript
POST /api/ai/analyze-emotion
POST /api/ai/analyze-journal
```

### Advanced

```javascript
// Pattern Analysis
POST /api/advanced/pattern-analysis
GET /api/advanced/patterns/weekly

// Reports
GET /api/advanced/daily-report

// Predictions
POST /api/advanced/predict-mood

// Coaching
POST /api/advanced/coach/feedback
POST /api/advanced/coach/exercise
GET /api/advanced/coach/encouragement
GET /api/advanced/coach/crisis-assessment

// Meeting Mode
POST /api/advanced/meeting/start
POST /api/advanced/meeting/:sessionId/emotion
GET /api/advanced/meeting/:sessionId/insights
GET /api/advanced/meeting/:sessionId/engagement
POST /api/advanced/meeting/:sessionId/end

// Notifications
POST /api/advanced/notifications/preferences
GET /api/advanced/notifications/preferences
POST /api/advanced/notifications/test
```

### Journal

```javascript
POST /api/journal/entry
GET /api/journal/entries
GET /api/journal/entry/:date
```

### Webhooks (n8n)

```javascript
POST /webhook/emotion-analysis
POST /webhook/user-summary
```

---

## Frontend Components

### Core Components

- **LiveEmotionDetector** - Webcam + face-api.js detection
- **RealTimeInsights** - AI recommendations
- **EmotionHistory** - Timeline view
- **QuickStats** - Dashboard metrics

### Advanced Components

- **EmotionCoach** - Interactive coaching
- **MoodPrediction** - Forecasting
- **PatternAnalysis** - Weekly patterns
- **DailyReport** - AI summaries

### Pages

- **Dashboard** (`/`) - Main emotion detection
- **Analytics** (`/analytics`) - Charts and trends
- **Journal** (`/journal`) - Mood journaling
- **Settings** (`/settings`) - Preferences

---

## Deployment

### Production Build

```bash
# Backend
cd backend
npm ci --only=production
NODE_ENV=production npm start

# Frontend (Next.js)
cd frontend
npm ci
npm run build
npm start

# OR React (Vite)
cd react-frontend
npm ci
npm run build
npm run preview
```

### Docker

```bash
docker-compose up -d
```

### Environment Variables

**Backend:**
```env
PORT=5000
NODE_ENV=production
JWT_SECRET=your-secret-key
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
N8N_WEBHOOK_URL=https://n8n.example.com/webhook/emotion
CORS_ORIGIN=https://your-domain.com
```

**Frontend:**
```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_WS_URL=wss://api.your-domain.com/ws
```

### Security Checklist

- [ ] Change JWT_SECRET to strong random value
- [ ] Enable HTTPS/WSS
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Use environment variables for secrets
- [ ] Enable logging and monitoring
- [ ] Regular dependency updates
- [ ] Database backups

---

## Troubleshooting

### Camera Not Working

1. Check browser permissions
2. Use HTTPS or localhost
3. Try Chrome/Edge (best support)
4. Check console for errors

### Face-API Models Not Loading

```bash
# Download to react-frontend/public/models/
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json
# ... (download all 6 files)
```

### AI API Errors

- Check API key in .env
- Verify API provider (openai/anthropic)
- Check rate limits
- Review logs in `backend/logs/`

### WebSocket Connection Failed

- Ensure backend is running
- Check VITE_WS_URL matches backend port
- Verify firewall settings
- Check browser console

### Database Issues

```bash
cd backend
npm run init-db
```

---

## Performance Optimization

### Backend

- Enable database WAL mode ✅
- Use connection pooling
- Implement caching (Redis)
- Optimize AI API calls (batch requests)

### Frontend

- Lazy load components ✅
- Code splitting ✅
- Image optimization
- Service worker caching ✅

---

## Contributing

1. Fork repository
2. Create feature branch
3. Add tests
4. Update documentation
5. Submit pull request

---

## License

MIT

---

## Support

- GitHub Issues
- Documentation: See `ADVANCED_FEATURES.md`
- API Reference: See `API.md`

---

## Disclaimer

⚠️ **This system is for wellness tracking only.**

It is **NOT**:
- A medical device
- A substitute for professional care
- Intended to diagnose or treat

**Crisis Resources:**
- US: 988 (Suicide & Crisis Lifeline)
- Crisis Text: Text HOME to 741741
- International: https://www.iasp.info/resources/Crisis_Centres/

---

## Credits

- **face-api.js** by @justadudewhohacks
- **TensorFlow.js** by Google
- **React** by Meta
- **OpenAI** & **Anthropic** for AI services
- **Tailwind CSS** for styling

---

**Built with ❤️ for emotional wellness**
