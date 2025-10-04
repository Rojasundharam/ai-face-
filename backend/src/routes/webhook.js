import express from 'express';
import { EmotionModel } from '../models/queries.js';
import { AnalyticsService } from '../services/AnalyticsService.js';
import logger from '../utils/logger.js';

const router = express.Router();

// n8n webhook endpoint for emotion analysis
router.post('/emotion-analysis', async (req, res, next) => {
  try {
    const { userId, timeframe = 'week' } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

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
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const emotions = EmotionModel.getByTimeframe(
      userId,
      startDate.toISOString(),
      now.toISOString()
    );

    const stats = AnalyticsService.calculateTimeframeStats(emotions);

    logger.info('Webhook: emotion analysis requested', { userId, timeframe });

    res.json({
      userId,
      timeframe,
      analysis: stats,
      timestamp: now.toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// Webhook endpoint for retrieving user summary
router.post('/user-summary', async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

    const dashboardData = await AnalyticsService.getDashboardData(userId);
    const report = AnalyticsService.generateReport(dashboardData);

    logger.info('Webhook: user summary requested', { userId });

    res.json({
      userId,
      summary: report,
      data: dashboardData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

export default router;
