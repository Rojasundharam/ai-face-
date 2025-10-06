import axios from 'axios';
import { config } from '../config/config.js';
import logger from '../utils/logger.js';

export class AdvancedAIService {
  constructor() {
    this.openaiKey = config.ai.openaiKey;
    this.claudeKey = config.ai.anthropicKey;
    this.provider = config.ai.provider || 'openai';
  }

  /**
   * Analyze emotion patterns with deep context
   */
  async analyzeEmotionPattern(emotionData, userContext) {
    const prompt = this.buildPatternAnalysisPrompt(emotionData, userContext);

    try {
      const response = await this.callAI(prompt, {
        temperature: 0.7,
        maxTokens: 800,
      });

      const analysis = this.parseAIResponse(response);

      return {
        analysis: analysis.analysis || 'Unable to generate detailed analysis',
        recommendations: analysis.recommendations || this.getFallbackRecommendations(emotionData),
        stressLevel: analysis.stressLevel || this.calculateStressLevel(emotionData),
        wellnessScore: analysis.wellnessScore || this.calculateWellnessScore(emotionData),
        prediction: analysis.prediction || null,
        insights: analysis.insights || [],
        triggers: analysis.triggers || [],
      };
    } catch (error) {
      logger.error('Pattern analysis failed', { error: error.message });
      return this.getFallbackAnalysis(emotionData, userContext);
    }
  }

  /**
   * Generate comprehensive daily report
   */
  async generateDailyReport(emotionHistory, journalEntries = []) {
    if (emotionHistory.length === 0) {
      return {
        summary: 'No emotion data available for today.',
        highlights: [],
        lowlights: [],
        recommendations: [],
        tomorrowForecast: null,
      };
    }

    const stats = this.calculateDailyStats(emotionHistory);
    const prompt = this.buildDailyReportPrompt(stats, journalEntries);

    try {
      const response = await this.callAI(prompt, {
        temperature: 0.8,
        maxTokens: 1000,
      });

      const report = this.parseAIResponse(response);

      return {
        summary: report.summary || this.generateFallbackSummary(stats),
        highlights: report.highlights || [],
        lowlights: report.lowlights || [],
        recommendations: report.recommendations || [],
        tomorrowForecast: report.tomorrowForecast || null,
        stats,
      };
    } catch (error) {
      logger.error('Daily report generation failed', { error: error.message });
      return this.getFallbackDailyReport(stats);
    }
  }

  /**
   * Detect emotional patterns and triggers
   */
  async detectEmotionalPatterns(weeklyData) {
    const patterns = {
      recurring: [],
      triggers: [],
      peakTimes: [],
      recommendations: [],
    };

    // Time-based pattern detection
    const timePatterns = this.analyzeTimePatterns(weeklyData);
    patterns.peakTimes = timePatterns;

    // Emotion clustering
    const clusters = this.clusterEmotions(weeklyData);
    patterns.recurring = clusters;

    // Trigger detection
    const triggers = this.identifyTriggers(weeklyData);
    patterns.triggers = triggers;

    // AI-enhanced pattern description
    try {
      const prompt = this.buildPatternDetectionPrompt(patterns, weeklyData);
      const response = await this.callAI(prompt, {
        temperature: 0.7,
        maxTokens: 600,
      });

      const aiAnalysis = this.parseAIResponse(response);

      return {
        ...patterns,
        description: aiAnalysis.description || 'Pattern analysis complete',
        recommendations: aiAnalysis.recommendations || [],
        severity: aiAnalysis.severity || 'low',
      };
    } catch (error) {
      logger.error('Pattern detection failed', { error: error.message });
      return patterns;
    }
  }

  /**
   * Predict mood for next N hours
   */
  async predictMood(historicalData, hoursAhead = 4) {
    if (historicalData.length < 10) {
      return {
        prediction: null,
        confidence: 0,
        message: 'Insufficient data for prediction',
      };
    }

    // Simple ML-based prediction using historical patterns
    const prediction = this.calculateMoodPrediction(historicalData, hoursAhead);

    // Enhance with AI insights
    try {
      const prompt = `Based on this emotion history, predict the likely emotional state in ${hoursAhead} hours:

Recent patterns: ${JSON.stringify(prediction.patterns)}
Current trend: ${prediction.trend}
Average wellness: ${prediction.avgWellness}

Provide a brief prediction (2-3 sentences) with confidence level (0-100).
Format as JSON: { "prediction": "text", "confidence": number, "advice": "text" }`;

      const response = await this.callAI(prompt, {
        temperature: 0.6,
        maxTokens: 200,
      });

      const aiPrediction = this.parseAIResponse(response);

      return {
        ...prediction,
        aiPrediction: aiPrediction.prediction || null,
        confidence: aiPrediction.confidence || prediction.confidence,
        advice: aiPrediction.advice || null,
      };
    } catch (error) {
      logger.error('Mood prediction failed', { error: error.message });
      return prediction;
    }
  }

  /**
   * Generate personalized recommendations
   */
  async generateRecommendations(emotionData, userProfile, context = {}) {
    const recommendations = [];

    // Rule-based recommendations
    if (emotionData.stressLevel > 70) {
      recommendations.push({
        type: 'stress_management',
        priority: 'high',
        title: 'Immediate Stress Relief',
        suggestion: 'Your stress level is elevated. Try the 4-7-8 breathing technique.',
        actions: ['start_breathing_exercise', 'take_break'],
      });
    }

    if (emotionData.dominantEmotion === 'sad' && emotionData.emotions.sad > 0.7) {
      recommendations.push({
        type: 'mood_boost',
        priority: 'medium',
        title: 'Mood Enhancement',
        suggestion: 'Consider light physical activity or connecting with a friend.',
        actions: ['suggest_activities', 'social_connection'],
      });
    }

    // AI-enhanced recommendations
    try {
      const prompt = this.buildRecommendationPrompt(emotionData, userProfile, context);
      const response = await this.callAI(prompt, {
        temperature: 0.8,
        maxTokens: 500,
      });

      const aiRecs = this.parseAIResponse(response);

      if (aiRecs.recommendations && Array.isArray(aiRecs.recommendations)) {
        recommendations.push(...aiRecs.recommendations);
      }
    } catch (error) {
      logger.error('AI recommendation generation failed', { error: error.message });
    }

    return recommendations.slice(0, 5); // Return top 5
  }

  // ===== Helper Methods =====

  buildPatternAnalysisPrompt(emotionData, userContext) {
    return `You are an empathetic AI wellness coach. Analyze this emotion data:

Current State:
- Emotions: ${JSON.stringify(emotionData.emotions)}
- Dominant: ${emotionData.dominantEmotion}
- Blink Rate: ${emotionData.blinkCount}/min (normal: 15-20)
- Timestamp: ${emotionData.timestamp}

Recent History (last 10 readings):
${JSON.stringify(userContext.recentHistory?.slice(0, 10) || [])}

Context:
- Time of day: ${new Date().getHours()}:00
- Day of week: ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}

Provide comprehensive analysis as JSON:
{
  "analysis": "Brief 2-3 sentence analysis of current state",
  "recommendations": [
    {"type": "string", "priority": "high|medium|low", "suggestion": "actionable advice"}
  ],
  "stressLevel": 0-100,
  "wellnessScore": 0-100,
  "prediction": "What to expect in next 4 hours",
  "insights": ["key insight 1", "key insight 2"],
  "triggers": ["potential trigger 1"]
}`;
  }

  buildDailyReportPrompt(stats, journalEntries) {
    return `Generate a compassionate daily emotional wellness report:

Today's Statistics:
- Total readings: ${stats.totalReadings}
- Average wellness: ${stats.avgWellness.toFixed(1)}
- Average stress: ${stats.avgStress.toFixed(1)}
- Dominant emotion: ${stats.mostCommonEmotion}
- Emotion distribution: ${JSON.stringify(stats.emotionDistribution)}

Journal Entries: ${journalEntries.length}
${journalEntries.map(e => `- Mood: ${e.mood_rating}/10, Text: "${e.journal_text?.substring(0, 100)}"`).join('\n')}

Generate JSON:
{
  "summary": "Overall assessment (3-4 sentences)",
  "highlights": ["positive moment 1", "positive moment 2"],
  "lowlights": ["challenge 1", "challenge 2"],
  "recommendations": ["suggestion for tomorrow"],
  "tomorrowForecast": "Brief prediction for tomorrow"
}`;
  }

  buildPatternDetectionPrompt(patterns, weeklyData) {
    return `Analyze these detected emotion patterns:

Time Patterns: ${JSON.stringify(patterns.peakTimes)}
Recurring Emotions: ${JSON.stringify(patterns.recurring)}
Potential Triggers: ${JSON.stringify(patterns.triggers)}

Weekly Summary:
- Total readings: ${weeklyData.length}
- Date range: ${weeklyData[0]?.timestamp} to ${weeklyData[weeklyData.length - 1]?.timestamp}

Provide JSON:
{
  "description": "What the patterns reveal (2-3 sentences)",
  "recommendations": ["based on patterns"],
  "severity": "low|medium|high"
}`;
  }

  buildRecommendationPrompt(emotionData, userProfile, context) {
    return `Generate personalized wellness recommendations:

User Profile:
- Preferences: ${JSON.stringify(userProfile.preferences || {})}
- History: ${context.history || 'Limited'}

Current State:
- Emotion: ${emotionData.dominantEmotion}
- Stress: ${emotionData.stressLevel}
- Wellness: ${emotionData.wellnessScore}

Generate 3-5 specific, actionable recommendations as JSON:
{
  "recommendations": [
    {
      "type": "category",
      "priority": "high|medium|low",
      "title": "Short title",
      "suggestion": "Specific actionable advice",
      "actions": ["action_id"]
    }
  ]
}`;
  }

  async callAI(prompt, options = {}) {
    if (this.provider === 'openai') {
      return await this.callOpenAI(prompt, options);
    } else if (this.provider === 'anthropic') {
      return await this.callAnthropic(prompt, options);
    }
    throw new Error('No AI provider configured');
  }

  async callOpenAI(prompt, options) {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a compassionate AI wellness coach specializing in emotional health.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 500,
      },
      {
        headers: {
          Authorization: `Bearer ${this.openaiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    return response.data.choices[0].message.content;
  }

  async callAnthropic(prompt, options) {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-haiku-20240307',
        max_tokens: options.maxTokens || 500,
        temperature: options.temperature || 0.7,
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          'x-api-key': this.claudeKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    return response.data.content[0].text;
  }

  parseAIResponse(response) {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return { text: response };
    } catch (error) {
      logger.warn('Failed to parse AI response as JSON', { error: error.message });
      return { text: response };
    }
  }

  // ===== Calculation Methods =====

  calculateStressLevel(emotionData) {
    const stressIndicators = {
      angry: 0.3,
      fearful: 0.4,
      sad: 0.2,
      disgusted: 0.1,
    };

    let stress = 0;
    for (const [emotion, weight] of Object.entries(stressIndicators)) {
      stress += (emotionData.emotions[emotion] || 0) * weight;
    }

    // Blink rate factor (normal: 15-20/min)
    if (emotionData.blinkCount) {
      const blinkDeviation = Math.abs(emotionData.blinkCount - 17.5) / 17.5;
      stress += Math.min(blinkDeviation * 0.3, 0.3);
    }

    return Math.min(Math.round(stress * 100), 100);
  }

  calculateWellnessScore(emotionData) {
    const positive = (emotionData.emotions.happy || 0) + (emotionData.emotions.surprised || 0) * 0.5;
    const negative = (emotionData.emotions.sad || 0) + (emotionData.emotions.angry || 0) + (emotionData.emotions.fearful || 0);

    const balance = (positive - negative + 1) / 2;
    const stress = this.calculateStressLevel(emotionData);
    const stressFactor = (100 - stress) / 100;

    return Math.round((balance * 0.6 + stressFactor * 0.4) * 100);
  }

  calculateDailyStats(emotionHistory) {
    const stats = {
      totalReadings: emotionHistory.length,
      avgWellness: 0,
      avgStress: 0,
      emotionDistribution: {},
      mostCommonEmotion: null,
      peakStressTime: null,
      lowestStressTime: null,
    };

    let totalWellness = 0;
    let totalStress = 0;
    const emotionCounts = {};

    emotionHistory.forEach((reading) => {
      totalWellness += reading.wellness_score || 0;
      totalStress += reading.stress_level || 0;

      const emotion = reading.dominant_emotion;
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });

    stats.avgWellness = totalWellness / emotionHistory.length;
    stats.avgStress = totalStress / emotionHistory.length;
    stats.emotionDistribution = emotionCounts;
    stats.mostCommonEmotion = Object.entries(emotionCounts).reduce((a, b) =>
      emotionCounts[a[0]] > emotionCounts[b[0]] ? a : b
    )[0];

    return stats;
  }

  analyzeTimePatterns(weeklyData) {
    const hourlyData = {};

    weeklyData.forEach((reading) => {
      const hour = new Date(reading.timestamp).getHours();
      if (!hourlyData[hour]) {
        hourlyData[hour] = { total: 0, stress: 0, wellness: 0 };
      }
      hourlyData[hour].total++;
      hourlyData[hour].stress += reading.stress_level || 0;
      hourlyData[hour].wellness += reading.wellness_score || 0;
    });

    const patterns = [];
    for (const [hour, data] of Object.entries(hourlyData)) {
      const avgStress = data.stress / data.total;
      if (avgStress > 60) {
        patterns.push({
          hour: parseInt(hour),
          type: 'high_stress',
          avgStress: avgStress.toFixed(1),
        });
      }
    }

    return patterns;
  }

  clusterEmotions(weeklyData) {
    // Simple clustering based on consecutive similar emotions
    const clusters = [];
    let currentCluster = null;

    weeklyData.forEach((reading, idx) => {
      if (!currentCluster || currentCluster.emotion !== reading.dominant_emotion) {
        if (currentCluster && currentCluster.count >= 3) {
          clusters.push(currentCluster);
        }
        currentCluster = {
          emotion: reading.dominant_emotion,
          count: 1,
          startTime: reading.timestamp,
        };
      } else {
        currentCluster.count++;
        currentCluster.endTime = reading.timestamp;
      }
    });

    return clusters.slice(0, 5);
  }

  identifyTriggers(weeklyData) {
    // Identify potential triggers by finding emotion spikes
    const triggers = [];

    for (let i = 1; i < weeklyData.length; i++) {
      const prev = weeklyData[i - 1];
      const curr = weeklyData[i];

      const stressIncrease = (curr.stress_level || 0) - (prev.stress_level || 0);

      if (stressIncrease > 20) {
        triggers.push({
          timestamp: curr.timestamp,
          stressIncrease: stressIncrease.toFixed(1),
          emotionChange: `${prev.dominant_emotion} → ${curr.dominant_emotion}`,
        });
      }
    }

    return triggers.slice(0, 3);
  }

  calculateMoodPrediction(historicalData, hoursAhead) {
    // Simple trend-based prediction
    const recent = historicalData.slice(-20);
    const avgWellness = recent.reduce((sum, r) => sum + (r.wellness_score || 0), 0) / recent.length;
    const avgStress = recent.reduce((sum, r) => sum + (r.stress_level || 0), 0) / recent.length;

    const trend = recent.length >= 10
      ? this.calculateTrend(recent.map(r => r.wellness_score))
      : 'stable';

    return {
      patterns: { trend },
      avgWellness: avgWellness.toFixed(1),
      avgStress: avgStress.toFixed(1),
      trend,
      confidence: Math.min(recent.length * 5, 80),
    };
  }

  calculateTrend(values) {
    if (values.length < 2) return 'stable';

    const first = values.slice(0, Math.floor(values.length / 2));
    const second = values.slice(Math.floor(values.length / 2));

    const avgFirst = first.reduce((a, b) => a + b, 0) / first.length;
    const avgSecond = second.reduce((a, b) => a + b, 0) / second.length;

    if (avgSecond > avgFirst + 5) return 'improving';
    if (avgSecond < avgFirst - 5) return 'declining';
    return 'stable';
  }

  getFallbackRecommendations(emotionData) {
    return [
      {
        type: 'general',
        priority: 'medium',
        suggestion: 'Continue tracking your emotions for personalized insights.',
      },
    ];
  }

  getFallbackAnalysis(emotionData, userContext) {
    return {
      analysis: `You're currently experiencing ${emotionData.dominantEmotion} emotions.`,
      recommendations: this.getFallbackRecommendations(emotionData),
      stressLevel: this.calculateStressLevel(emotionData),
      wellnessScore: this.calculateWellnessScore(emotionData),
      prediction: null,
      insights: [],
      triggers: [],
    };
  }

  generateFallbackSummary(stats) {
    return `Today you had ${stats.totalReadings} emotion readings. Your most common emotion was ${stats.mostCommonEmotion}.`;
  }

  getFallbackDailyReport(stats) {
    return {
      summary: this.generateFallbackSummary(stats),
      highlights: [],
      lowlights: [],
      recommendations: [],
      tomorrowForecast: null,
      stats,
    };
  }
}
