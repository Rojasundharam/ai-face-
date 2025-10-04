# Quick Setup Guide

## Prerequisites
- Node.js 18+ installed
- npm or yarn
- Webcam for emotion detection
- (Optional) OpenAI or Anthropic API key for AI insights

## Quick Start (Development)

### 1. Install Backend

\`\`\`bash
cd backend
npm install
\`\`\`

### 2. Configure Backend

\`\`\`bash
# Copy example environment file
cp .env.example .env

# Edit .env and set:
# - JWT_SECRET (required)
# - OPENAI_API_KEY or ANTHROPIC_API_KEY (optional for AI features)
\`\`\`

### 3. Initialize Database

\`\`\`bash
npm run init-db
\`\`\`

### 4. Start Backend

\`\`\`bash
npm run dev
# Backend will run on http://localhost:5000
\`\`\`

### 5. Install Frontend (New Terminal)

\`\`\`bash
cd frontend
npm install
\`\`\`

### 6. Configure Frontend

\`\`\`bash
# Copy example environment file
cp .env.local.example .env.local

# Default values should work for local development
\`\`\`

### 7. Start Frontend

\`\`\`bash
npm run dev
# Frontend will run on http://localhost:3000
\`\`\`

### 8. Access Application

1. Open browser to http://localhost:3000
2. Register a new account
3. Start using the emotion detection system!

## Production Deployment (Docker)

### 1. Configure Environment

\`\`\`bash
# Create .env file in root directory
cp .env.example .env

# Edit .env and set all required values
\`\`\`

### 2. Build and Run

\`\`\`bash
docker-compose up -d
\`\`\`

### 3. Access Application

Application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Testing the System

1. **Register/Login**
   - Create account at http://localhost:3000
   - Login with your credentials

2. **Test Emotion Detection**
   - Go to "Emotion Detector" tab
   - Allow webcam access
   - Click "Start Detection"
   - Make different facial expressions to see emotion changes

3. **Check Dashboard**
   - View wellness metrics
   - See emotion distribution

4. **Create Journal Entry**
   - Go to "Mood Journal" tab
   - Create a new entry
   - Add mood rating and text
   - See AI analysis (if API key configured)

5. **View Analytics**
   - Go to "Analytics" tab
   - View detailed reports and charts

## Troubleshooting

### Backend Issues

**Port already in use:**
\`\`\`bash
# Change PORT in backend/.env
PORT=5001
\`\`\`

**Database errors:**
\`\`\`bash
# Re-initialize database
cd backend
npm run init-db
\`\`\`

### Frontend Issues

**Module not found:**
\`\`\`bash
# Reinstall dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install
\`\`\`

**API connection errors:**
- Ensure backend is running
- Check NEXT_PUBLIC_API_URL in .env.local

### Webcam Issues

- Use Chrome or Edge for best compatibility
- Ensure you're on localhost or HTTPS
- Check browser permissions for camera

## Next Steps

- Configure AI API keys for personalized insights
- Set up n8n webhooks for notifications
- Customize emotion detection thresholds
- Add custom wellness recommendations

## Support

For issues:
1. Check logs in `backend/logs/`
2. Review browser console for frontend errors
3. Ensure all environment variables are set
4. Verify Node.js version is 18+
