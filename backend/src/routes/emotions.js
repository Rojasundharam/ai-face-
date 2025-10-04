import express from 'express';
import { EmotionModel } from '../models/queries.js';
import { EmotionAnalyzer } from '../services/EmotionAnalyzer.js';
import { AIInsightService } from '../services/AIInsightService.js';
import { NotificationService } from '../services/NotificationService.js';
import { validate, schemas } from '../utils/validation.js';
import { authenticateToken } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

router.post('/record', authenticateToken, async (req, res, next) => {
  try {
    const validatedData = validate(schemas.emotionReading, req.body);
    const { emotions, blinkCount, sessionId } = validatedData;

    // Analyze emotions
    const dominantEmotion = EmotionAnalyzer.calculateDominantEmotion(emotions);
    const stressLevel = EmotionAnalyzer.calculateStressLevel(emotions, blinkCount);
    const wellnessScore = EmotionAnalyzer.calculateWellnessScore(emotions, stressLevel);

    // Get recent history for pattern detection
    const recentHistory = EmotionModel.getByUserId(req.user.userId, 10);
    const pattern = EmotionAnalyzer.detectPatterns(recentHistory);

    // Generate recommendations
    const recommendations = EmotionAnalyzer.generateRecommendations(
      emotions,
      stressLevel,
      wellnessScore,
      pattern
    );

    // Get AI insight (async, don't await)
    let aiInsight = null;
    try {
      aiInsight = await AIInsightService.generateInsight(
        { emotions, dominantEmotion, stressLevel, wellnessScore },
        { recentPattern: pattern?.pattern }
      );
    } catch (error) {
      logger.warn('AI insight generation failed, using fallback', { error: error.message });
    }

    // Save to database
    const result = EmotionModel.create({
      userId: req.user.userId,
      emotions,
      dominantEmotion,
      blinkCount,
      stressLevel,
      wellnessScore,
      aiInsight,
      recommendations,
      sessionId
    });

    // Send notifications for high stress or concerning patterns
    if (stressLevel > 75) {
      NotificationService.notifyHighStress(req.user.userId, {
        stressLevel,
        dominantEmotion,
        recommendations
      });
    }

    if (pattern?.type === 'concerning') {
      NotificationService.notifyConcerningPattern(req.user.userId, pattern);
    }

    logger.info('Emotion recorded', {
      userId: req.user.userId,
      emotionId: result.lastInsertRowid,
      dominantEmotion,
      stressLevel
    });

    res.status(201).json({
      id: result.lastInsertRowid,
      dominantEmotion,
      stressLevel,
      wellnessScore,
      aiInsight,
      recommendations,
      pattern
    });
  } catch (error) {
    next(error);
  }
});

router.get('/history/:timeframe', authenticateToken, async (req, res, next) => {
  try {
    const { timeframe } = req.params;
    const now = new Date();
    let startDate;

    switch (timeframe) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        const emotions = EmotionModel.getByUserId(req.user.userId, 1000);
        return res.json({ emotions });
      default:
        return res.status(400).json({ error: 'Invalid timeframe' });
    }

    const emotions = EmotionModel.getByTimeframe(
      req.user.userId,
      startDate.toISOString(),
      now.toISOString()
    );

    res.json({ emotions });
  } catch (error) {
    next(error);
  }
});

router.get('/session/:sessionId', authenticateToken, async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const emotions = EmotionModel.getBySessionId(sessionId);

    res.json({ emotions });
  } catch (error) {
    next(error);
  }
});

export default router;
