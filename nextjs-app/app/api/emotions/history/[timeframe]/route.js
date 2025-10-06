import { NextResponse } from 'next/server';
import { EmotionModel } from '@/lib/db/queries.js';
import { withAuth } from '@/lib/middleware/authMiddleware.js';
import logger from '@/lib/utils/logger.js';

async function getHistory(request, { params }) {
  try {
    const { timeframe } = params;
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
        const emotions = EmotionModel.getByUserId(request.user.userId, 1000);
        return NextResponse.json({ emotions });
      default:
        return NextResponse.json(
          { error: 'Invalid timeframe' },
          { status: 400 }
        );
    }

    const emotions = EmotionModel.getByTimeframe(
      request.user.userId,
      startDate.toISOString(),
      now.toISOString()
    );

    return NextResponse.json({ emotions });
  } catch (error) {
    logger.error('Get history error', { error: error.message });
    return NextResponse.json(
      { error: error.message || 'Failed to fetch history' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getHistory);
