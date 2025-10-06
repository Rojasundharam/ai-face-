# Quick Start Guide

Get your AI Emotion Detection Next.js app running in 5 minutes!

## Prerequisites Checklist

- [ ] Node.js 18+ installed (`node --version`)
- [ ] Webcam available
- [ ] At least 1GB free disk space

## Installation (5 Steps)

### Step 1: Navigate to Project
```bash
cd C:\Users\admin\Downloads\ai-face-\nextjs-app
```

### Step 2: Install Dependencies
```bash
npm install
```
⏱️ This takes 2-3 minutes

### Step 3: Set Environment Variables
Open `.env.local` and update:
```env
JWT_SECRET=change-this-to-a-random-string-min-32-chars
```

You can generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Initialize Database
```bash
npm run init-db
```

### Step 5: Download Face Detection Models

Create models directory:
```bash
mkdir -p public/models
```

Download these files to `public/models/`:
1. Go to: https://github.com/justadudewhohacks/face-api.js/tree/master/weights
2. Download:
   - `tiny_face_detector_model-weights_manifest.json`
   - `tiny_face_detector_model-shard1`
   - `face_landmark_68_model-weights_manifest.json`
   - `face_landmark_68_model-shard1`
   - `face_expression_model-weights_manifest.json`
   - `face_expression_model-shard1`

Or use this shortcut (requires curl):
```bash
cd public/models
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-shard1
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-shard1
cd ../..
```

## Start the App

```bash
npm run dev
```

**Access at:** http://localhost:3000

## First Time Setup

1. **Register Account**
   - Go to http://localhost:3000
   - Click "Register"
   - Create account with email and password

2. **Allow Webcam**
   - Browser will ask for camera permission
   - Click "Allow"

3. **Start Detection**
   - Click "Start Detection" button
   - Your emotion will be detected in real-time!

## Verify Everything Works

- [ ] Registration works
- [ ] Login works
- [ ] Webcam loads
- [ ] Face is detected (green box around face)
- [ ] Emotions display (happy, sad, etc.)
- [ ] Dashboard shows stats
- [ ] Analytics page loads
- [ ] Journal page works

## Quick Troubleshooting

### Error: "Cannot find module"
```bash
npm install
```

### Error: "Port 3000 already in use"
```bash
# Kill the process
npx kill-port 3000
# Then restart
npm run dev
```

### Error: "Failed to load models"
- Verify `public/models/` directory exists
- Verify all 6 model files are present
- Check file names match exactly

### Face detection not working
- Ensure good lighting
- Face the camera directly
- Allow camera permissions
- Try refreshing the page

### WebSocket not connecting
- Ensure you're using `npm run dev` (not `next dev`)
- Check `.env.local` has correct `NEXT_PUBLIC_WS_URL`
- Check firewall settings

## Optional: AI Features

To enable AI insights (optional):

1. Get OpenAI API key from: https://platform.openai.com/api-keys

2. Add to `.env.local`:
```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-key-here
```

3. Restart server:
```bash
npm run dev
```

## File Structure Quick Reference

```
nextjs-app/
├── app/              # Pages & API routes
│   ├── page.jsx      # Dashboard (home)
│   ├── analytics/    # Analytics page
│   ├── journal/      # Journal page
│   └── api/          # API endpoints
├── components/       # React components
├── lib/              # Backend code
├── public/           # Static files
│   └── models/       # Face detection models (you add these)
├── .env.local        # Configuration
└── server.js         # Custom server
```

## Need Help?

1. Check `README.md` for detailed documentation
2. Check `MIGRATION_GUIDE.md` for common issues
3. Check browser console (F12) for errors
4. Check `logs/` directory for server logs

## What's Next?

- Explore the dashboard
- Try emotion detection
- Write a journal entry
- Check your analytics
- Customize settings
- Enable AI insights (optional)

---

**Ready to detect emotions!** 🎭

Start with: `npm run dev`

Visit: http://localhost:3000
