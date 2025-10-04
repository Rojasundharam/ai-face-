# AI Emotion Detection System

A complete AI-powered emotion detection and wellness tracking system with real-time facial analysis, mood journaling, and personalized insights.

## Features

- 🎥 **Real-time Emotion Detection** - Webcam-based facial emotion recognition using TensorFlow.js
- 📊 **Wellness Dashboard** - Track stress levels, wellness scores, and emotional patterns
- 📝 **Mood Journal** - Daily journaling with AI-powered analysis
- 📈 **Analytics & Reports** - Detailed emotion trends and insights
- 🤖 **AI Insights** - Personalized recommendations from OpenAI/Anthropic
- ⚡ **Real-time Updates** - WebSocket-based live emotion streaming
- 🔔 **n8n Integration** - Automated notifications and workflows
- 🔐 **JWT Authentication** - Secure user authentication

## Tech Stack

### Backend
- Node.js + Express
- SQLite (better-sqlite3)
- WebSocket (ws)
- JWT Authentication
- OpenAI/Anthropic API
- Winston (logging)

### Frontend
- Next.js 14 + TypeScript
- TensorFlow.js + MediaPipe Face Mesh
- React Webcam
- Chart.js
- Zustand (state management)
- Tailwind CSS

## Prerequisites

- Node.js 18+
- npm or yarn
- Webcam (for emotion detection)
- OpenAI or Anthropic API key (optional, for AI insights)

## Installation

### 1. Clone the repository

\`\`\`bash
git clone <repository-url>
cd emotion-detection-ai
\`\`\`

### 2. Backend Setup

\`\`\`bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your API keys
# Required: JWT_SECRET
# Optional: OPENAI_API_KEY or ANTHROPIC_API_KEY

# Create required directories
mkdir -p logs uploads/journal

# Start backend
npm run dev
\`\`\`

Backend will run on http://localhost:5000

### 3. Frontend Setup

\`\`\`bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.local.example .env.local

# Start frontend
npm run dev
\`\`\`

Frontend will run on http://localhost:3000

## Usage

1. **Register/Login**
   - Visit http://localhost:3000
   - Create an account or login

2. **Emotion Detection**
   - Go to "Emotion Detector" tab
   - Allow webcam access
   - Click "Start Detection"
   - View real-time emotion analysis

3. **Dashboard**
   - View wellness metrics and trends
   - Check emotion distribution charts
   - Monitor stress levels

4. **Mood Journal**
   - Create daily journal entries
   - Upload photos (optional)
   - Get AI-powered analysis

5. **Analytics**
   - View detailed reports
   - Track emotional patterns over time
   - Export data

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
- `GET /api/analytics/report` - Generate report

### AI
- `POST /api/ai/analyze-emotion` - Get AI insight for emotion
- `POST /api/ai/analyze-journal` - Analyze journal entry

### Journal
- `POST /api/journal/entry` - Create journal entry
- `GET /api/journal/entries` - Get journal entries
- `GET /api/journal/entry/:date` - Get entry by date

### Webhooks (n8n)
- `POST /webhook/emotion-analysis` - Get emotion analysis
- `POST /webhook/user-summary` - Get user summary

## Database Schema

### Users Table
\`\`\`sql
- id (INTEGER PRIMARY KEY)
- username (TEXT UNIQUE)
- email (TEXT UNIQUE)
- password_hash (TEXT)
- preferences (JSON)
- created_at (DATETIME)
\`\`\`

### Emotion Readings Table
\`\`\`sql
- id (INTEGER PRIMARY KEY)
- user_id (INTEGER)
- timestamp (DATETIME)
- emotions (JSON)
- dominant_emotion (TEXT)
- blink_count (INTEGER)
- stress_level (REAL)
- wellness_score (REAL)
- ai_insight (TEXT)
- recommendations (JSON)
- session_id (TEXT)
\`\`\`

### Mood Journal Table
\`\`\`sql
- id (INTEGER PRIMARY KEY)
- user_id (INTEGER)
- date (DATE)
- mood_rating (INTEGER 1-10)
- journal_text (TEXT)
- ai_analysis (TEXT)
- tags (JSON)
- photo_path (TEXT)
\`\`\`

## Production Deployment

### Using Docker Compose

\`\`\`bash
# Create .env file in root directory with:
# JWT_SECRET=your-secret-key
# OPENAI_API_KEY=your-key (optional)
# ANTHROPIC_API_KEY=your-key (optional)
# N8N_WEBHOOK_URL=your-n8n-url (optional)

# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
\`\`\`

### Manual Deployment

#### Backend
\`\`\`bash
cd backend
npm ci --only=production
NODE_ENV=production npm start
\`\`\`

#### Frontend
\`\`\`bash
cd frontend
npm ci
npm run build
npm start
\`\`\`

## Configuration

### Backend Environment Variables
\`\`\`
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key
AI_PROVIDER=openai (or anthropic)
OPENAI_API_KEY=your-key
ANTHROPIC_API_KEY=your-key
N8N_WEBHOOK_URL=your-n8n-webhook-url
DB_PATH=./emotion_detection.db
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
\`\`\`

### Frontend Environment Variables
\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=ws://localhost:5000/ws
\`\`\`

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS configuration
- Input validation with Joi
- SQL injection prevention (parameterized queries)

## Performance Optimizations

- WebSocket for real-time updates
- SQLite WAL mode for better concurrency
- Database indexes on frequently queried columns
- Client-side caching with Zustand
- Lazy loading of components
- Image optimization

## Browser Support

- Chrome/Edge (recommended for best TensorFlow.js performance)
- Firefox
- Safari (limited TensorFlow.js support)

## Troubleshooting

### Webcam not working
- Ensure HTTPS or localhost
- Check browser permissions
- Try different browser

### TensorFlow.js errors
- Clear browser cache
- Update browser
- Check console for specific errors

### Database locked errors
- Restart backend server
- Check file permissions
- Ensure only one backend instance running

## License

MIT

## Contributing

Pull requests welcome! Please ensure:
1. Code follows existing style
2. All tests pass
3. Documentation updated
4. Commits are descriptive

## Support

For issues and questions:
- Create GitHub issue
- Check documentation
- Review API endpoints

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Voice emotion detection
- [ ] Multi-user support
- [ ] Advanced AI models
- [ ] Data export features
- [ ] Integration with wearables
- [ ] Group therapy features
- [ ] Professional therapist dashboard
# ai-face-
