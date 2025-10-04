import express from 'express';
import { AnalyticsService } from '../services/AnalyticsService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', authenticateToken, async (req, res, next) => {
  try {
    const dashboardData = await AnalyticsService.getDashboardData(req.user.userId);
    res.json(dashboardData);
  } catch (error) {
    next(error);
  }
});

router.get('/report', authenticateToken, async (req, res, next) => {
  try {
    const dashboardData = await AnalyticsService.getDashboardData(req.user.userId);
    const report = AnalyticsService.generateReport(dashboardData);

    res.json({ report, data: dashboardData });
  } catch (error) {
    next(error);
  }
});

export default router;
