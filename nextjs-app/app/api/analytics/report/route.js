import { NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/services/AnalyticsService.js';
import { withAuth } from '@/lib/middleware/authMiddleware.js';
import logger from '@/lib/utils/logger.js';

async function getReport(request) {
  try {
    const dashboardData = await AnalyticsService.getDashboardData(request.user.userId);
    const report = AnalyticsService.generateReport(dashboardData);

    return NextResponse.json({ report, data: dashboardData });
  } catch (error) {
    logger.error('Report error', { error: error.message });
    return NextResponse.json(
      { error: error.message || 'Failed to generate report' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getReport);
