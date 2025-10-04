# Advanced AI Features & Integration Guide

## Overview

This document describes the advanced AI features implemented in the emotion detection system, including emotion coaching, mood prediction, pattern analysis, and smart notifications.

## 🤖 Advanced AI Services

### 1. **AdvancedAIService**

Enhanced AI analysis with deep contextual understanding.

#### Features:
- **Pattern Analysis** - Detects recurring emotional patterns and triggers
- **Daily Reports** - Comprehensive AI-generated wellness summaries
- **Mood Prediction** - ML-based forecasting (2-12 hours ahead)
- **Personalized Recommendations** - Context-aware suggestions

#### API Endpoints:

```javascript
POST /api/advanced/pattern-analysis
Body: {
  emotionData: { emotions, dominantEmotion, stressLevel, wellnessScore },
  includeHistory: true
}
Response: {
  analysis: "Brief analysis",
  recommendations: [...],
  stressLevel: 0-100,
  wellnessScore: 0-100,
  prediction: "4-hour forecast",
  insights: [],
  triggers: []
}

GET /api/advanced/daily-report
Response: {
  summary: "Daily overview",
  highlights: ["positive moments"],
  lowlights: ["challenges"],
  recommendations: ["for tomorrow"],
  tomorrowForecast: "prediction",
  stats: { totalReadings, avgWellness, avgStress, ... }
}

GET /api/advanced/patterns/weekly
Response: {
  recurring: [{ emotion, count, startTime }],
  triggers: [{ timestamp, stressIncrease, emotionChange }],
  peakTimes: [{ hour, avgStress }],
  description: "AI analysis",
  recommendations: [],
  severity: "low|medium|high"
}

POST /api/advanced/predict-mood
Body: { hoursAhead: 4 }
Response: {
  aiPrediction: "text forecast",
  confidence: 0-100,
  advice: "recommendation",
  trend: "improving|declining|stable",
  avgWellness: number,
  avgStress: number
}
```

---

### 2. **EmotionCoach**

Real-time coaching system with personalized feedback.

#### Features:
- **Live Feedback** - Instant coaching based on current state
- **Breathing Exercises** - Guided stress relief techniques
- **Mood Interventions** - Active support for negative emotions
- **Crisis Assessment** - Risk detection and resource provision
- **Positive Reinforcement** - Encouragement and motivation

#### API Endpoints:

```javascript
POST /api/advanced/coach/feedback
Body: { emotionData, context }
Response: {
  feedback: [{
    type: "breathing_exercise|wellness_boost|mood_intervention",
    priority: "high|medium|low",
    message: "coaching message",
    action: "action_id",
    instructions: ["step 1", "step 2"],
    suggestions: []
  }]
}

POST /api/advanced/coach/exercise
Body: { emotion: "sad", stressLevel: 75 }
Response: {
  exercise: {
    name: "Exercise Name",
    duration: 300,
    steps: ["instruction 1", ...],
    urgency: "high|medium|low",
    note: "additional guidance"
  }
}

GET /api/advanced/coach/encouragement
Response: {
  messages: [{
    type: "celebration|achievement|consistency|support",
    message: "motivational text",
    tone: "enthusiastic|supportive|compassionate"
  }],
  trend: "improving|declining|stable"
}

GET /api/advanced/coach/crisis-assessment
Response: {
  risk: "low|medium|high",
  message: "assessment message",
  resources: [{ name, number, description }],
  factors: {
    prolongedSadness: boolean,
    highStressStreak: boolean,
    concerningJournal: boolean
  }
}
```

---

### 3. **MeetingMode**

Engagement and attention tracking during meetings/presentations.

#### Features:
- **Session Management** - Track entire meeting duration
- **Engagement Analysis** - Calculate attention and participation
- **Live Insights** - Real-time stress and mood monitoring
- **Detailed Reports** - Post-meeting analytics

#### API Endpoints:

```javascript
POST /api/advanced/meeting/start
Body: {
  meetingInfo: {
    title: "Meeting Title",
    type: "presentation|interview|general",
    participants: 1
  }
}
Response: { session: { id, userId, startTime, ... } }

POST /api/advanced/meeting/:sessionId/emotion
Body: { emotionData }
Response: { success: true }

GET /api/advanced/meeting/:sessionId/insights
Response: {
  currentMood: "emotion",
  avgStress: number,
  avgWellness: number,
  alerts: [{
    type: "high_stress|low_engagement",
    message: "alert text",
    priority: "high|medium|low"
  }]
}

GET /api/advanced/meeting/:sessionId/engagement
Response: {
  engagementScore: 0-100,
  breakdown: {
    attentionScore: number,
    emotionalEngagement: number,
    stressBalance: number,
    participationIndicators: number
  },
  status: "excellent|good|moderate|low",
  recommendations: []
}

POST /api/advanced/meeting/:sessionId/end
Response: {
  report: {
    sessionId, meetingInfo, duration, totalReadings,
    analytics: { engagementScore, ... },
    summary: {...},
    emotionTimeline: [{ time, dominantEmotion, avgStress }]
  }
}
```

---

### 4. **SmartNotificationSystem**

Intelligent notification delivery with user preferences.

#### Features:
- **Contextual Notifications** - Based on emotion state
- **Quiet Hours** - Respect user schedule
- **Priority Routing** - Critical alerts bypass filters
- **Multi-Channel** - WebSocket, webhook, email, SMS support
- **Rate Limiting** - Prevent notification fatigue

#### API Endpoints:

```javascript
POST /api/advanced/notifications/preferences
Body: {
  preferences: {
    enabled: true,
    channels: ["in_app", "webhook", "email"],
    quietHours: { start: 22, end: 7 },
    frequency: "low|normal|high",
    types: {
      stress_alerts: true,
      wellness_tips: true,
      achievements: true,
      daily_summary: true,
      crisis_support: true
    }
  }
}
Response: { success: true, preferences }

GET /api/advanced/notifications/preferences
Response: { preferences }

POST /api/advanced/notifications/test
Body: { type: "wellness_tip|achievement" }
Response: { success: true, message: "Test notification sent" }
```

---

## 🎯 Frontend Components

### EmotionCoach.jsx

Interactive coaching interface with exercises.

```jsx
import EmotionCoach from '@/components/EmotionCoach';

// Usage
<EmotionCoach />
```

**Features:**
- Real-time coaching feedback
- Interactive breathing exercises with timer
- Step-by-step guidance
- Priority-based alerts

---

### MoodPrediction.jsx

AI-powered mood forecasting.

```jsx
import MoodPrediction from '@/components/MoodPrediction';

// Usage
<MoodPrediction />
```

**Features:**
- Adjustable time horizon (2-12 hours)
- Confidence indicators
- Trend visualization
- AI-generated advice

---

### PatternAnalysis.jsx

Weekly pattern detection and visualization.

```jsx
import PatternAnalysis from '@/components/PatternAnalysis';

// Usage
<PatternAnalysis />
```

**Features:**
- Recurring pattern detection
- Trigger identification
- Peak stress time analysis
- Severity assessment
- Actionable recommendations

---

### DailyReport.jsx

Comprehensive daily wellness summary.

```jsx
import DailyReport from '@/components/DailyReport';

// Usage
<DailyReport />
```

**Features:**
- AI-generated summary
- Highlights and lowlights
- Statistical overview
- Tomorrow's forecast
- Personalized recommendations

---

## 🔧 Configuration

### AI Provider Setup

```env
# Backend .env
AI_PROVIDER=openai  # or anthropic
OPENAI_API_KEY=your-key
ANTHROPIC_API_KEY=your-key
```

### Notification Channels

```javascript
// Configure in Settings page or via API
const preferences = {
  enabled: true,
  channels: [
    'in_app',    // WebSocket notifications
    'webhook',   // n8n integration
    'email',     // Email notifications
    'sms'        // SMS notifications
  ],
  quietHours: { start: 22, end: 7 },
  frequency: 'normal'
};
```

---

## 💡 Use Cases

### 1. **Personal Wellness Tracking**
- Track daily emotions
- Receive coaching feedback
- Get mood predictions
- Build healthy habits

### 2. **Professional Meetings**
- Monitor engagement during presentations
- Track stress levels in interviews
- Analyze team meetings
- Improve communication effectiveness

### 3. **Mental Health Support**
- Crisis risk assessment
- Professional resource recommendations
- Pattern identification for therapy
- Daily wellness reports

### 4. **Productivity Optimization**
- Identify peak performance times
- Detect stress triggers
- Optimize work schedules
- Balance work-life wellness

---

## 📊 Algorithms

### Mood Prediction
Uses historical trend analysis:
1. Analyze last 20 readings
2. Calculate wellness/stress averages
3. Detect trend (improving/declining/stable)
4. Apply confidence weighting based on data quantity
5. Enhance with AI contextual prediction

### Pattern Detection
Multi-layered analysis:
1. **Time-based** - Hourly stress aggregation
2. **Clustering** - Consecutive similar emotions
3. **Spike Detection** - Sudden stress increases >20 points
4. **AI Enhancement** - Contextual pattern description

### Engagement Scoring
Weighted formula:
```
engagementScore = (
  attentionScore * 0.3 +
  emotionalEngagement * 0.3 +
  stressBalance * 0.2 +
  participationIndicators * 0.2
) * 100
```

### Wellness Score
Balanced calculation:
```
emotionalBalance = (positiveEmotions - negativeEmotions + 1) / 2
stressFactor = (100 - stressLevel) / 100
wellnessScore = (emotionalBalance * 0.6 + stressFactor * 0.4) * 100
```

---

## 🔒 Privacy & Security

- **Local Processing** - Face detection runs client-side
- **Encrypted Storage** - JWT authentication
- **User Control** - Full data export/deletion
- **Optional AI** - Can disable cloud AI analysis
- **HIPAA Considerations** - Not medical device, for wellness only

---

## 🚀 Performance

- **AI Response Time** - 1-3 seconds (with caching)
- **Pattern Detection** - <500ms (100 readings)
- **Mood Prediction** - <1 second
- **Real-time Coaching** - <200ms

---

## 📝 Error Handling

All AI services include:
- **Retry Logic** - 3 attempts with exponential backoff
- **Fallback Responses** - Rule-based defaults
- **Graceful Degradation** - Continues without AI if unavailable
- **Logging** - Comprehensive error tracking

---

## 🎓 Best Practices

1. **Data Collection** - Track for at least 3 days before relying on predictions
2. **AI API Keys** - Use environment variables, never commit
3. **Notification Frequency** - Start with "normal", adjust based on user feedback
4. **Crisis Resources** - Update with local/regional resources
5. **Testing** - Use `/notifications/test` endpoint before production

---

## 📚 Resources

- OpenAI API: https://platform.openai.com/docs
- Anthropic Claude: https://docs.anthropic.com
- n8n Webhooks: https://docs.n8n.io/integrations/webhook/
- Mental Health Resources: https://www.samhsa.gov/find-help/national-helpline

---

## 🤝 Contributing

To add new AI features:

1. Create service in `backend/src/services/`
2. Add routes in `backend/src/routes/advanced.js`
3. Create frontend component in `react-frontend/src/components/`
4. Update this documentation
5. Add tests

---

## ⚠️ Disclaimer

This system is for wellness tracking only. It is **NOT**:
- A medical device
- A substitute for professional mental health care
- Intended to diagnose or treat any condition

If experiencing severe emotional distress, please contact a mental health professional or crisis hotline immediately.

**Crisis Resources:**
- National Suicide Prevention Lifeline: 988
- Crisis Text Line: Text HOME to 741741
- International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/
