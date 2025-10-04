import express from 'express';
import { AIInsightService } from '../services/AIInsightService.js';
import { authenticateToken } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/analyze-emotion', authenticateToken, aiLimiter, async (req, res, next) => {
  try {
    const { emotions, dominantEmotion, stressLevel, wellnessScore, context } = req.body;

    if (!emotions || !dominantEmotion) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const insight = await AIInsightService.generateInsight(
      { emotions, dominantEmotion, stressLevel, wellnessScore },
      context || {}
    );

    res.json({ insight });
  } catch (error) {
    next(error);
  }
});

router.post('/analyze-journal', authenticateToken, aiLimiter, async (req, res, next) => {
  try {
    const { journalText, moodRating } = req.body;

    if (!journalText || !moodRating) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const analysis = await AIInsightService.analyzeJournalEntry(journalText, moodRating);

    res.json({ analysis });
  } catch (error) {
    next(error);
  }
});

export default router;
