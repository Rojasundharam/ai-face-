import express from 'express';
import { AdvancedAIService } from '../services/AdvancedAIService.js';
import { EmotionCoach } from '../services/EmotionCoach.js';
import { MeetingMode } from '../services/MeetingMode.js';
import { smartNotificationSystem } from '../services/SmartNotificationSystem.js';
import { EmotionModel, JournalModel } from '../models/queries.js';
import { authenticateToken } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import logger from '../utils/logger.js';

const router = express.Router();
const aiService = new AdvancedAIService();
const emotionCoach = new EmotionCoach();
const meetingMode = new MeetingMode();

// ===== Advanced AI Analysis =====

router.post('/pattern-analysis', authenticateToken, aiLimiter, async (req, res, next) => {
  try {
    const { emotionData, includeHistory } = req.body;

    const userContext = {};

    if (includeHistory) {
      userContext.recentHistory = EmotionModel.getByUserId(req.user.userId, 20);
    }

    const analysis = await aiService.analyzeEmotionPattern(emotionData, userContext);

    res.json(analysis);
  } catch (error) {
    next(error);
  }
});

router.get('/daily-report', authenticateToken, aiLimiter, async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const emotionHistory = EmotionModel.getByTimeframe(
      req.user.userId,
      today.toISOString(),
      tomorrow.toISOString()
    );

    const journalEntries = JournalModel.getByUserId(req.user.userId, 1);

    const report = await aiService.generateDailyReport(emotionHistory, journalEntries);

    // Send notification if enabled
    await smartNotificationSystem.sendDailySummary(req.user.userId, report);

    res.json(report);
  } catch (error) {
    next(error);
  }
});

router.get('/patterns/weekly', authenticateToken, aiLimiter, async (req, res, next) => {
  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyData = EmotionModel.getByTimeframe(
      req.user.userId,
      weekAgo.toISOString(),
      new Date().toISOString()
    );

    const patterns = await aiService.detectEmotionalPatterns(weeklyData);

    // Send pattern alert if concerning
    if (patterns.severity === 'high') {
      await smartNotificationSystem.sendPatternAlert(req.user.userId, patterns);
    }

    res.json(patterns);
  } catch (error) {
    next(error);
  }
});

router.post('/predict-mood', authenticateToken, aiLimiter, async (req, res, next) => {
  try {
    const { hoursAhead = 4 } = req.body;

    const historicalData = EmotionModel.getByUserId(req.user.userId, 100);

    const prediction = await aiService.predictMood(historicalData, hoursAhead);

    res.json(prediction);
  } catch (error) {
    next(error);
  }
});

router.post('/recommendations', authenticateToken, aiLimiter, async (req, res, next) => {
  try {
    const { emotionData, context } = req.body;

    const userProfile = {
      userId: req.user.userId,
      preferences: {}, // Could load from database
    };

    const recommendations = await aiService.generateRecommendations(
      emotionData,
      userProfile,
      context
    );

    res.json({ recommendations });
  } catch (error) {
    next(error);
  }
});

// ===== Emotion Coaching =====

router.post('/coach/feedback', authenticateToken, async (req, res, next) => {
  try {
    const { emotionData, context } = req.body;

    const feedback = await emotionCoach.provideLiveFeedback(emotionData, context);

    // Process notifications
    await smartNotificationSystem.processEmotionReading(
      req.user.userId,
      emotionData,
      context
    );

    res.json({ feedback });
  } catch (error) {
    next(error);
  }
});

router.post('/coach/exercise', authenticateToken, async (req, res, next) => {
  try {
    const { emotion, stressLevel } = req.body;

    const exercise = await emotionCoach.suggestExercise(emotion, stressLevel);

    res.json({ exercise });
  } catch (error) {
    next(error);
  }
});

router.get('/coach/encouragement', authenticateToken, async (req, res, next) => {
  try {
    const recentData = EmotionModel.getByUserId(req.user.userId, 20);

    let trend = 'stable';
    if (recentData.length >= 10) {
      const firstHalf = recentData.slice(0, 5);
      const secondHalf = recentData.slice(5, 10);

      const avgFirst = firstHalf.reduce((sum, r) => sum + r.wellness_score, 0) / 5;
      const avgSecond = secondHalf.reduce((sum, r) => sum + r.wellness_score, 0) / 5;

      if (avgSecond > avgFirst + 5) trend = 'improving';
      if (avgSecond < avgFirst - 5) trend = 'declining';
    }

    const messages = await emotionCoach.provideEncouragement(trend);

    res.json({ messages, trend });
  } catch (error) {
    next(error);
  }
});

router.get('/coach/crisis-assessment', authenticateToken, async (req, res, next) => {
  try {
    const emotionHistory = EmotionModel.getByUserId(req.user.userId, 200);
    const journalEntries = JournalModel.getByUserId(req.user.userId, 10);

    const assessment = emotionCoach.assessCrisisRisk(emotionHistory, journalEntries);

    // Send crisis support notification if needed
    if (assessment.risk === 'high') {
      await smartNotificationSystem.sendCrisisSupport(req.user.userId, assessment);
    }

    res.json(assessment);
  } catch (error) {
    next(error);
  }
});

// ===== Meeting Mode =====

router.post('/meeting/start', authenticateToken, async (req, res, next) => {
  try {
    const { meetingInfo } = req.body;

    const session = meetingMode.startSession(req.user.userId, meetingInfo);

    res.json({ session });
  } catch (error) {
    next(error);
  }
});

router.post('/meeting/:sessionId/emotion', authenticateToken, async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { emotionData } = req.body;

    const session = meetingMode.addEmotionReading(sessionId, emotionData);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.get('/meeting/:sessionId/insights', authenticateToken, async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const insights = meetingMode.getLiveInsights(sessionId);

    res.json(insights);
  } catch (error) {
    next(error);
  }
});

router.get('/meeting/:sessionId/engagement', authenticateToken, async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const engagement = meetingMode.analyzeEngagement(sessionId);

    res.json(engagement);
  } catch (error) {
    next(error);
  }
});

router.post('/meeting/:sessionId/end', authenticateToken, async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const report = meetingMode.endSession(sessionId);

    res.json({ report });
  } catch (error) {
    next(error);
  }
});

// ===== Notifications =====

router.post('/notifications/preferences', authenticateToken, async (req, res, next) => {
  try {
    const { preferences } = req.body;

    smartNotificationSystem.setUserPreferences(req.user.userId, preferences);

    res.json({ success: true, preferences });
  } catch (error) {
    next(error);
  }
});

router.get('/notifications/preferences', authenticateToken, async (req, res, next) => {
  try {
    const preferences = smartNotificationSystem.getUserPreferences(req.user.userId);

    res.json({ preferences });
  } catch (error) {
    next(error);
  }
});

router.post('/notifications/test', authenticateToken, async (req, res, next) => {
  try {
    const { type } = req.body;

    const testNotifications = {
      wellness_tip: {
        message: 'Drink water and take a short walk to boost your mood!',
      },
      achievement: {
        message: 'You\'ve tracked your emotions for 7 days straight!',
      },
    };

    const tip = testNotifications[type] || testNotifications.wellness_tip;

    if (type === 'wellness_tip') {
      await smartNotificationSystem.sendWellnessTip(req.user.userId, tip);
    } else if (type === 'achievement') {
      await smartNotificationSystem.sendAchievement(req.user.userId, tip);
    }

    res.json({ success: true, message: 'Test notification sent' });
  } catch (error) {
    next(error);
  }
});

export default router;
