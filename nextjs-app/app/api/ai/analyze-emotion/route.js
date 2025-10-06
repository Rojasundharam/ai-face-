import { NextResponse } from 'next/server';
import { AIInsightService } from '@/lib/services/AIInsightService.js';
import { withAuth } from '@/lib/middleware/authMiddleware.js';
import logger from '@/lib/utils/logger.js';

async function analyzeEmotion(request) {
  try {
    const body = await request.json();
    const { emotions, dominantEmotion, stressLevel, wellnessScore, context } = body;

    if (!emotions || !dominantEmotion) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const insight = await AIInsightService.generateInsight(
      { emotions, dominantEmotion, stressLevel, wellnessScore },
      context || {}
    );

    return NextResponse.json({ insight });
  } catch (error) {
    logger.error('AI analysis error', { error: error.message });
    return NextResponse.json(
      { error: error.message || 'Failed to analyze emotion' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(analyzeEmotion);
