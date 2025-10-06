import { NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/services/AnalyticsService.js';
import logger from '@/lib/utils/logger.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const dashboardData = await AnalyticsService.getDashboardData(userId);
    const report = AnalyticsService.generateReport(dashboardData);

    logger.info('Webhook: user summary requested', { userId });

    return NextResponse.json({
      userId,
      summary: report,
      data: dashboardData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Webhook user summary error', { error: error.message });
    return NextResponse.json(
      { error: error.message || 'Webhook failed' },
      { status: 500 }
    );
  }
}
