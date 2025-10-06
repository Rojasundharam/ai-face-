import { NextResponse } from 'next/server';
import { AdvancedAIService } from '@/lib/services/AdvancedAIService.js';
import { EmotionModel, JournalModel } from '@/lib/db/queries.js';
import { withAuth } from '@/lib/middleware/authMiddleware.js';
import logger from '@/lib/utils/logger.js';

const aiService = new AdvancedAIService();

async function getDailyReport(request) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const emotionHistory = EmotionModel.getByTimeframe(
      request.user.userId,
      today.toISOString(),
      tomorrow.toISOString()
    );

    const journalEntries = JournalModel.getByUserId(request.user.userId, 1);

    const report = await aiService.generateDailyReport(
      emotionHistory,
      journalEntries[0] || null
    );

    return NextResponse.json(report);
  } catch (error) {
    logger.error('Daily report error', { error: error.message });
    return NextResponse.json(
      { error: error.message || 'Failed to generate daily report' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getDailyReport);
