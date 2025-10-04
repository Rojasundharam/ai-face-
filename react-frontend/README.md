# AI Emotion Detection - React Frontend

A modern, glassmorphism-themed React application for real-time emotion detection using face-api.js and TensorFlow.js.

## Features

### 🎯 Core Features
- **Real-time Emotion Detection** - Webcam-based facial emotion recognition
- **Blink Detection** - EAR (Eye Aspect Ratio) algorithm for blink tracking
- **Live FPS Counter** - Performance monitoring
- **Glassmorphism UI** - Modern, beautiful design with dark/light mode
- **PWA Support** - Install as a mobile/desktop app
- **Offline Mode** - Works without internet (with limitations)
- **WebSocket** - Real-time emotion streaming

### 📊 Pages & Components

#### Dashboard (/)
- **LiveEmotionDetector** - Real-time webcam analysis
- **RealTimeInsights** - AI-powered recommendations
- **EmotionHistory** - Recent emotion timeline
- **QuickStats** - At-a-glance metrics

#### Analytics (/analytics)
- **Emotion Distribution Charts** - Doughnut charts
- **Wellness Trends** - Line graphs
- **Dominant Emotions** - Bar charts
- **Weekly Comparisons** - Progress tracking

#### Journal (/journal)
- **MoodJournalEntry** - Daily mood logging
- **JournalHistory** - Past entries
- **AIAnalysis** - AI-powered insights
- **MoodCalendar** - Visual calendar

#### Settings (/settings)
- **Theme Toggle** - Dark/light mode
- **AI Provider** - Choose OpenAI/Anthropic
- **Privacy Settings** - Data control
- **Data Export** - Download your data

## Tech Stack

- **React 18** - Latest React with hooks
- **Vite** - Lightning-fast build tool
- **face-api.js** - Facial emotion detection
- **TensorFlow.js** - ML inference
- **Framer Motion** - Smooth animations
- **Chart.js** - Data visualizations
- **Tailwind CSS** - Utility-first styling
- **LocalForage** - Offline data storage
- **React Router** - Navigation
- **React Hot Toast** - Notifications

## Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Webcam (for emotion detection)

### Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Download face-api.js models (IMPORTANT!)
# Create public/models directory and download:
# - tiny_face_detector_model-weights_manifest.json
# - tiny_face_detector_model-shard1
# - face_expression_model-weights_manifest.json
# - face_expression_model-shard1
# - face_landmark_68_model-weights_manifest.json
# - face_landmark_68_model-shard1
# From: https://github.com/justadudewhohacks/face-api.js/tree/master/weights

# Start development server
npm run dev
```

The app will be available at http://localhost:3000

## Face-API Models

Download the required models:

```bash
mkdir -p public/models
cd public/models

# Download from face-api.js repository:
# https://github.com/justadudewhohacks/face-api.js/tree/master/weights

# Required models:
# - tiny_face_detector
# - face_expression
# - face_landmark_68
```

## Environment Variables

```env
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000/ws
```

## Usage

### 1. Login/Register
- Create account or login
- Credentials stored securely with JWT

### 2. Start Detection
- Allow camera permissions
- Click "Start Detection"
- View real-time emotions

### 3. View Insights
- AI-powered recommendations
- Wellness metrics
- Stress level tracking

### 4. Journal Entries
- Create daily mood logs
- Get AI analysis
- View calendar

### 5. Analytics
- Track emotional patterns
- View trends over time
- Export data

## Glassmorphism Design

The app uses a custom glassmorphism design:

```css
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

### Custom Utilities
- `.card` - Glassmorphism cards
- `.btn-primary` - Gradient buttons
- `.text-gradient` - Gradient text
- `.shadow-glow` - Glowing shadows

## PWA Features

- **Offline Support** - Works without internet
- **Install Prompt** - Add to home screen
- **Background Sync** - Sync when online
- **Push Notifications** - (Optional)

## Performance

- **Face Detection** - 10 FPS (~100ms per frame)
- **Emotion Analysis** - Real-time
- **Blink Detection** - EAR algorithm
- **Optimized Rendering** - Framer Motion
- **Lazy Loading** - Code splitting

## Browser Support

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ⚠️ Safari (Limited TensorFlow.js support)
- ❌ IE11 (Not supported)

## Offline Mode

The app supports offline operation:

1. **Local Storage** - Emotions cached locally
2. **Service Worker** - PWA capabilities
3. **Offline Queue** - Syncs when online
4. **Fallback UI** - Graceful degradation

## Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Project Structure

```
src/
├── components/
│   ├── LiveEmotionDetector.jsx
│   ├── RealTimeInsights.jsx
│   ├── EmotionHistory.jsx
│   ├── QuickStats.jsx
│   ├── Navbar.jsx
│   ├── Layout.jsx
│   └── ParticlesBackground.jsx
├── pages/
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Analytics.jsx
│   ├── Journal.jsx
│   └── Settings.jsx
├── context/
│   ├── AuthContext.jsx
│   ├── EmotionContext.jsx
│   ├── WebSocketContext.jsx
│   └── ThemeContext.jsx
├── utils/
│   ├── api.js
│   ├── faceDetection.js
│   ├── particles.js
│   └── registerSW.js
├── App.jsx
├── main.jsx
└── index.css
```

## Troubleshooting

### Camera Not Working
- Check browser permissions
- Use HTTPS or localhost
- Try different browser

### Models Not Loading
- Download face-api.js models to `public/models`
- Check console for errors
- Verify model files are correct

### WebSocket Connection Failed
- Ensure backend is running on port 5000
- Check VITE_WS_URL environment variable
- Verify firewall settings

### Poor Performance
- Reduce detection interval in settings
- Close other resource-intensive tabs
- Use Chrome for best performance

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT

## Credits

- face-api.js by @justadudewhohacks
- TensorFlow.js by Google
- React by Meta
- Tailwind CSS

## Support

For issues and questions:
- GitHub Issues
- Documentation
- API Reference
