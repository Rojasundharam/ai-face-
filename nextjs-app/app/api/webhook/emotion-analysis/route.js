import { NextResponse } from 'next/server';
import { EmotionModel } from '@/lib/db/queries.js';
import { AnalyticsService } from '@/lib/services/AnalyticsService.js';
import logger from '@/lib/utils/logger.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, timeframe = 'week' } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
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

    return NextResponse.json({
      userId,
      timeframe,
      analysis: stats,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    logger.error('Webhook emotion analysis error', { error: error.message });
    return NextResponse.json(
      { error: error.message || 'Webhook failed' },
      { status: 500 }
    );
  }
}
