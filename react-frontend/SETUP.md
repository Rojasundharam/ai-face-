# Quick Setup Guide - React Frontend

## Prerequisites
- Node.js 18+
- npm or yarn
- Webcam
- Backend running on port 5000

## Quick Start

### 1. Install Dependencies

```bash
cd react-frontend
npm install
```

### 2. Download Face-API Models

**IMPORTANT**: The app requires face-api.js models to work.

```bash
# Create models directory
mkdir -p public/models

# Download models from:
# https://github.com/justadudewhohacks/face-api.js/tree/master/weights

# Required files:
# public/models/
#   ├── tiny_face_detector_model-weights_manifest.json
#   ├── tiny_face_detector_model-shard1
#   ├── face_expression_model-weights_manifest.json
#   ├── face_expression_model-shard1
#   ├── face_landmark_68_model-weights_manifest.json
#   └── face_landmark_68_model-shard1
```

**Quick Download Script**:

```bash
cd public/models

# Download tiny face detector
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1

# Download face expression model
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-shard1

# Download face landmark model
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-shard1
```

### 3. Configure Environment

```bash
# Copy example file
cp .env.example .env

# Default values (should work if backend is on port 5000):
# VITE_API_URL=http://localhost:5000
# VITE_WS_URL=ws://localhost:5000/ws
```

### 4. Start Development Server

```bash
npm run dev
```

App will be available at: **http://localhost:3000**

### 5. Build for Production

```bash
npm run build
npm run preview
```

## Testing the App

1. **Open http://localhost:3000**
2. **Register** a new account
3. **Login** with your credentials
4. **Dashboard** - Click "Start Detection"
5. **Allow** camera permissions
6. **Make** different facial expressions
7. **View** real-time emotion analysis

## Troubleshooting

### Models Not Loading

```bash
# Check if models directory exists
ls -la public/models

# Should show 6 files
# If missing, download using script above
```

### Camera Permission Denied

1. Click the lock icon in browser address bar
2. Allow camera permission
3. Refresh page

### Backend Connection Error

```bash
# Verify backend is running
curl http://localhost:5000/health

# Should return: {"status":"ok","timestamp":"..."}
```

### Port Already in Use

```bash
# Change port in vite.config.js
# Or kill process on port 3000
lsof -ti:3000 | xargs kill
```

## Features to Test

✅ **Dashboard**
- Start/stop detection
- View real-time emotions
- See blink count
- Check AI insights

✅ **Analytics**
- View emotion charts
- Check wellness trends
- Toggle timeframes

✅ **Journal**
- Create mood entry
- View calendar
- Check AI analysis

✅ **Settings**
- Toggle dark mode
- Adjust detection interval
- Export data

## Performance Tips

1. **Chrome/Edge** - Best performance
2. **Good Lighting** - Better detection
3. **Face Camera** - Keep face in frame
4. **Close Distance** - ~2 feet from camera

## Next Steps

1. Explore all pages
2. Create journal entries
3. View analytics
4. Customize settings
5. Export your data

## Support

Issues? Check:
- Browser console (F12)
- Network tab for API errors
- Backend logs
- Model files present
