export class MeetingMode {
  constructor() {
    this.activeSessions = new Map();
  }

  /**
   * Start a meeting session
   */
  startSession(userId, meetingInfo = {}) {
    const sessionId = `meeting-${Date.now()}-${userId}`;

    const session = {
      id: sessionId,
      userId,
      startTime: new Date(),
      meetingInfo: {
        title: meetingInfo.title || 'Untitled Meeting',
        type: meetingInfo.type || 'general', // general, presentation, interview, etc.
        participants: meetingInfo.participants || 1,
      },
      emotionStream: [],
      analytics: {
        engagementScore: 0,
        attentionSpans: [],
        stressLevels: [],
        participationRate: 0,
      },
    };

    this.activeSessions.set(sessionId, session);
    return session;
  }

  /**
   * Add emotion reading to meeting session
   */
  addEmotionReading(sessionId, emotionData) {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Meeting session not found');
    }

    session.emotionStream.push({
      timestamp: new Date(),
      ...emotionData,
    });

    // Update analytics
    this.updateSessionAnalytics(session);

    return session;
  }

  /**
   * Analyze engagement during meeting
   */
  analyzeEngagement(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Meeting session not found');
    }

    const stream = session.emotionStream;
    if (stream.length === 0) {
      return { engagementScore: 0, status: 'no_data' };
    }

    // Calculate engagement metrics
    const engagement = {
      attentionScore: this.calculateAttentionScore(stream),
      emotionalEngagement: this.calculateEmotionalEngagement(stream),
      stressBalance: this.calculateStressBalance(stream),
      participationIndicators: this.detectParticipation(stream),
    };

    // Overall engagement score (0-100)
    const engagementScore = Math.round(
      engagement.attentionScore * 0.3 +
      engagement.emotionalEngagement * 0.3 +
      engagement.stressBalance * 0.2 +
      engagement.participationIndicators * 0.2
    );

    return {
      engagementScore,
      breakdown: engagement,
      status: this.getEngagementStatus(engagementScore),
      recommendations: this.generateMeetingRecommendations(engagement),
    };
  }

  /**
   * Get real-time meeting insights
   */
  getLiveInsights(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Meeting session not found');
    }

    const recentReadings = session.emotionStream.slice(-10);
    if (recentReadings.length === 0) {
      return { status: 'waiting_for_data' };
    }

    const avgStress = recentReadings.reduce((sum, r) => sum + (r.stressLevel || 0), 0) / recentReadings.length;
    const avgWellness = recentReadings.reduce((sum, r) => sum + (r.wellnessScore || 0), 0) / recentReadings.length;

    const dominantEmotions = this.getDominantEmotions(recentReadings);

    const insights = {
      currentMood: dominantEmotions[0],
      avgStress: avgStress.toFixed(1),
      avgWellness: avgWellness.toFixed(1),
      alerts: [],
    };

    // Generate alerts
    if (avgStress > 70) {
      insights.alerts.push({
        type: 'high_stress',
        message: 'Stress level is elevated. Consider a short break.',
        priority: 'high',
      });
    }

    if (dominantEmotions[0] === 'neutral' && recentReadings.length > 5) {
      insights.alerts.push({
        type: 'low_engagement',
        message: 'Engagement may be dropping. Try interactive elements.',
        priority: 'medium',
      });
    }

    return insights;
  }

  /**
   * End meeting session and generate report
   */
  endSession(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Meeting session not found');
    }

    session.endTime = new Date();
    session.duration = (session.endTime - session.startTime) / 1000; // seconds

    // Final analytics
    const finalAnalytics = this.analyzeEngagement(sessionId);

    const report = {
      sessionId: session.id,
      meetingInfo: session.meetingInfo,
      duration: session.duration,
      totalReadings: session.emotionStream.length,
      analytics: finalAnalytics,
      summary: this.generateMeetingSummary(session, finalAnalytics),
      emotionTimeline: this.createEmotionTimeline(session.emotionStream),
    };

    // Remove from active sessions
    this.activeSessions.delete(sessionId);

    return report;
  }

  // ===== Helper Methods =====

  updateSessionAnalytics(session) {
    const stream = session.emotionStream;

    if (stream.length === 0) return;

    const latest = stream[stream.length - 1];

    session.analytics.stressLevels.push(latest.stressLevel || 0);
    session.analytics.engagementScore = this.calculateAttentionScore(stream);
  }

  calculateAttentionScore(stream) {
    // Based on eye contact (blink rate) and emotion consistency
    const avgBlinkRate = stream.reduce((sum, r) => sum + (r.blinkCount || 0), 0) / stream.length;

    // Normal blink rate (15-20) indicates attention
    const blinkScore = Math.max(0, 100 - Math.abs(avgBlinkRate - 17.5) * 5);

    // Emotion variety indicates engagement (not zoning out)
    const uniqueEmotions = new Set(stream.map(r => r.dominantEmotion)).size;
    const varietyScore = Math.min(uniqueEmotions * 15, 100);

    return (blinkScore * 0.6 + varietyScore * 0.4);
  }

  calculateEmotionalEngagement(stream) {
    // Positive emotions + appropriate reactions indicate engagement
    const emotionScores = {
      happy: 80,
      surprised: 75,
      interested: 85,
      neutral: 50,
      sad: 30,
      angry: 40,
      fearful: 35,
    };

    const avgScore = stream.reduce((sum, r) => {
      const score = emotionScores[r.dominantEmotion] || 50;
      return sum + score;
    }, 0) / stream.length;

    return avgScore;
  }

  calculateStressBalance(stream) {
    // Moderate stress is okay, too high or too low indicates issues
    const avgStress = stream.reduce((sum, r) => sum + (r.stressLevel || 0), 0) / stream.length;

    // Optimal stress: 30-60
    if (avgStress >= 30 && avgStress <= 60) {
      return 100;
    } else if (avgStress < 30) {
      return 100 - (30 - avgStress) * 2; // Too relaxed
    } else {
      return 100 - (avgStress - 60) * 2; // Too stressed
    }
  }

  detectParticipation(stream) {
    // Changes in emotion indicate active participation
    let changes = 0;
    for (let i = 1; i < stream.length; i++) {
      if (stream[i].dominantEmotion !== stream[i - 1].dominantEmotion) {
        changes++;
      }
    }

    const changeRate = changes / stream.length;
    return Math.min(changeRate * 200, 100);
  }

  getDominantEmotions(readings) {
    const emotionCounts = {};

    readings.forEach(r => {
      const emotion = r.dominantEmotion;
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });

    return Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([emotion]) => emotion);
  }

  getEngagementStatus(score) {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'moderate';
    return 'low';
  }

  generateMeetingRecommendations(engagement) {
    const recs = [];

    if (engagement.attentionScore < 60) {
      recs.push('Consider making content more interactive or taking a break');
    }

    if (engagement.emotionalEngagement < 50) {
      recs.push('Try incorporating engaging elements like Q&A or discussions');
    }

    if (engagement.stressBalance < 50) {
      recs.push('Stress levels may be affecting engagement. Check pacing and complexity');
    }

    return recs;
  }

  generateMeetingSummary(session, analytics) {
    return {
      title: session.meetingInfo.title,
      duration: `${Math.round(session.duration / 60)} minutes`,
      overallEngagement: analytics.status,
      engagementScore: analytics.engagementScore,
      keyInsights: [
        `Attention score: ${analytics.breakdown.attentionScore.toFixed(1)}`,
        `Emotional engagement: ${analytics.breakdown.emotionalEngagement.toFixed(1)}`,
      ],
      recommendations: analytics.recommendations,
    };
  }

  createEmotionTimeline(stream) {
    // Group by 5-minute intervals
    const intervalMs = 5 * 60 * 1000;
    const timeline = [];

    if (stream.length === 0) return timeline;

    const startTime = stream[0].timestamp.getTime();

    stream.forEach(reading => {
      const elapsed = reading.timestamp.getTime() - startTime;
      const interval = Math.floor(elapsed / intervalMs);

      if (!timeline[interval]) {
        timeline[interval] = {
          time: `${interval * 5}-${(interval + 1) * 5} min`,
          emotions: [],
          avgStress: 0,
          count: 0,
        };
      }

      timeline[interval].emotions.push(reading.dominantEmotion);
      timeline[interval].avgStress += reading.stressLevel || 0;
      timeline[interval].count++;
    });

    // Calculate averages
    timeline.forEach(interval => {
      if (interval) {
        interval.avgStress /= interval.count;
        interval.dominantEmotion = this.getDominantEmotions(
          interval.emotions.map(e => ({ dominantEmotion: e }))
        )[0];
      }
    });

    return timeline.filter(Boolean);
  }
}
