import { NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/services/AnalyticsService.js';
import { withAuth } from '@/lib/middleware/authMiddleware.js';
import logger from '@/lib/utils/logger.js';

async function getDashboard(request) {
  try {
    const dashboardData = await AnalyticsService.getDashboardData(request.user.userId);
    return NextResponse.json(dashboardData);
  } catch (error) {
    logger.error('Dashboard error', { error: error.message });
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getDashboard);
