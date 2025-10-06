import { NextResponse } from 'next/server';
import { AdvancedAIService } from '@/lib/services/AdvancedAIService.js';
import { EmotionModel } from '@/lib/db/queries.js';
import { withAuth } from '@/lib/middleware/authMiddleware.js';
import logger from '@/lib/utils/logger.js';

const aiService = new AdvancedAIService();

async function analyzePattern(request) {
  try {
    const body = await request.json();
    const { emotionData, includeHistory } = body;

    const userContext = {};

    if (includeHistory) {
      userContext.recentHistory = EmotionModel.getByUserId(request.user.userId, 20);
    }

    const analysis = await aiService.analyzeEmotionPattern(emotionData, userContext);

    return NextResponse.json(analysis);
  } catch (error) {
    logger.error('Pattern analysis error', { error: error.message });
    return NextResponse.json(
      { error: error.message || 'Failed to analyze pattern' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(analyzePattern);
