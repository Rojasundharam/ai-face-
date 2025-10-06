export class EmotionAnalyzer {
  static calculateDominantEmotion(emotions) {
    return Object.entries(emotions).reduce((a, b) =>
      emotions[a[0]] > emotions[b[0]] ? a : b
    )[0];
  }

  static calculateStressLevel(emotions, blinkCount) {
    // Stress calculation based on emotion patterns and blink rate
    const stressIndicators = {
      angry: 0.3,
      fearful: 0.4,
      sad: 0.2,
      surprised: 0.1
    };

    let stressScore = 0;
    for (const [emotion, weight] of Object.entries(stressIndicators)) {
      if (emotions[emotion]) {
        stressScore += emotions[emotion] * weight;
      }
    }

    // Normal blink rate: 15-20 per minute
    // High blink rate (>30) or low (<10) indicates stress
    const blinkStress = Math.abs(blinkCount - 17.5) / 17.5;
    stressScore += Math.min(blinkStress * 0.3, 0.3);

    return Math.min(stressScore * 100, 100);
  }

  static calculateWellnessScore(emotions, stressLevel) {
    // Wellness based on positive emotions and low stress
    const positiveEmotions = (emotions.happy || 0) + (emotions.surprised || 0) * 0.5;
    const negativeEmotions = (emotions.sad || 0) + (emotions.angry || 0) + (emotions.fearful || 0);

    const emotionalBalance = (positiveEmotions - negativeEmotions + 1) / 2; // Normalize to 0-1
    const stressFactor = (100 - stressLevel) / 100;

    return Math.round((emotionalBalance * 0.6 + stressFactor * 0.4) * 100);
  }

  static detectPatterns(emotionHistory) {
    if (emotionHistory.length < 5) return null;

    const recentEmotions = emotionHistory.slice(0, 10);
    const emotionCounts = {};

    recentEmotions.forEach(reading => {
      const emotion = reading.dominant_emotion;
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });

    // Check for concerning patterns
    if (emotionCounts.sad >= 7 || emotionCounts.angry >= 7) {
      return {
        type: 'concerning',
        pattern: 'persistent_negative_emotion',
        emotion: emotionCounts.sad >= 7 ? 'sad' : 'angry',
        frequency: Math.max(emotionCounts.sad || 0, emotionCounts.angry || 0)
      };
    }

    if (emotionCounts.happy >= 7) {
      return {
        type: 'positive',
        pattern: 'consistent_happiness',
        frequency: emotionCounts.happy
      };
    }

    return {
      type: 'neutral',
      pattern: 'varied_emotions',
      distribution: emotionCounts
    };
  }

  static generateRecommendations(emotions, stressLevel, wellnessScore, pattern) {
    const recommendations = [];

    if (stressLevel > 70) {
      recommendations.push({
        type: 'stress_management',
        priority: 'high',
        suggestion: 'Take a 5-10 minute break. Try deep breathing exercises or a short walk.'
      });
    }

    if (wellnessScore < 40) {
      recommendations.push({
        type: 'wellness',
        priority: 'medium',
        suggestion: 'Consider engaging in activities you enjoy or connecting with friends.'
      });
    }

    if (pattern?.type === 'concerning') {
      recommendations.push({
        type: 'mental_health',
        priority: 'high',
        suggestion: 'Your emotional pattern suggests you might benefit from talking to someone. Consider reaching out to a mental health professional.'
      });
    }

    if (emotions.sad > 0.6 || emotions.angry > 0.6) {
      recommendations.push({
        type: 'activity',
        priority: 'medium',
        suggestion: 'Physical activity can help improve mood. Try a short workout or yoga session.'
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        type: 'maintenance',
        priority: 'low',
        suggestion: 'You\'re doing well! Keep maintaining healthy habits and self-awareness.'
      });
    }

    return recommendations;
  }
}
