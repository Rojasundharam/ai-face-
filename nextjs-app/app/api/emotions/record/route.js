import { NextResponse } from 'next/server';
import { EmotionModel } from '@/lib/db/queries.js';
import { EmotionAnalyzer } from '@/lib/services/EmotionAnalyzer.js';
import { AIInsightService } from '@/lib/services/AIInsightService.js';
import { NotificationService } from '@/lib/services/NotificationService.js';
import { validate, schemas } from '@/lib/utils/validation.js';
import { withAuth } from '@/lib/middleware/authMiddleware.js';
import logger from '@/lib/utils/logger.js';

async function recordEmotion(request) {
  try {
    const body = await request.json();
    const validatedData = validate(schemas.emotionReading, body);
    const { emotions, blinkCount, sessionId } = validatedData;

    // Analyze emotions
    const dominantEmotion = EmotionAnalyzer.calculateDominantEmotion(emotions);
    const stressLevel = EmotionAnalyzer.calculateStressLevel(emotions, blinkCount);
    const wellnessScore = EmotionAnalyzer.calculateWellnessScore(emotions, stressLevel);

    // Get recent history for pattern detection
    const recentHistory = EmotionModel.getByUserId(request.user.userId, 10);
    const pattern = EmotionAnalyzer.detectPatterns(recentHistory);

    // Generate recommendations
    const recommendations = EmotionAnalyzer.generateRecommendations(
      emotions,
      stressLevel,
      wellnessScore,
      pattern
    );

    // Get AI insight (async, don't await)
    let aiInsight = null;
    try {
      aiInsight = await AIInsightService.generateInsight(
        { emotions, dominantEmotion, stressLevel, wellnessScore },
        { recentPattern: pattern?.pattern }
      );
    } catch (error) {
      logger.warn('AI insight generation failed, using fallback', { error: error.message });
    }

    // Save to database
    const result = EmotionModel.create({
      userId: request.user.userId,
      emotions,
      dominantEmotion,
      blinkCount,
      stressLevel,
      wellnessScore,
      aiInsight,
      recommendations,
      sessionId,
    });

    // Send notifications for high stress or concerning patterns
    if (stressLevel > 75) {
      NotificationService.notifyHighStress(request.user.userId, {
        stressLevel,
        dominantEmotion,
        recommendations,
      });
    }

    if (pattern?.type === 'concerning') {
      NotificationService.notifyConcerningPattern(request.user.userId, pattern);
    }

    logger.info('Emotion recorded', {
      userId: request.user.userId,
      emotionId: result.lastInsertRowid,
      dominantEmotion,
      stressLevel,
    });

    return NextResponse.json(
      {
        id: result.lastInsertRowid,
        dominantEmotion,
        stressLevel,
        wellnessScore,
        aiInsight,
        recommendations,
        pattern,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Emotion record error', { error: error.message });
    return NextResponse.json(
      { error: error.message || 'Failed to record emotion' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(recordEmotion);
