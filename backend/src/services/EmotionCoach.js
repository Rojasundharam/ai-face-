import logger from '../utils/logger.js';

export class EmotionCoach {
  constructor() {
    this.feedbackThresholds = {
      highStress: 70,
      lowWellness: 40,
      rapidChange: 30,
    };
  }

  /**
   * Provide real-time coaching feedback
   */
  async provideLiveFeedback(currentEmotion, context = {}) {
    const feedback = [];

    // High stress detection
    if (currentEmotion.stressLevel > this.feedbackThresholds.highStress) {
      feedback.push({
        type: 'breathing_exercise',
        priority: 'high',
        message: 'High stress detected. Try the 4-7-8 breathing technique.',
        action: 'start_breathing_guide',
        duration: 300, // 5 minutes
        instructions: [
          'Breathe in through nose for 4 seconds',
          'Hold breath for 7 seconds',
          'Exhale through mouth for 8 seconds',
          'Repeat 4 times',
        ],
      });
    }

    // Low wellness intervention
    if (currentEmotion.wellnessScore < this.feedbackThresholds.lowWellness) {
      feedback.push({
        type: 'wellness_boost',
        priority: 'medium',
        message: 'Your wellness score is low. Consider taking a short break.',
        action: 'suggest_break',
        suggestions: [
          'Take a 5-minute walk',
          'Listen to calming music',
          'Practice gratitude - list 3 things you\'re thankful for',
          'Stretch or do light exercise',
        ],
      });
    }

    // Negative emotion duration
    if (this.isNegativeEmotion(currentEmotion.dominantEmotion)) {
      if (context.negativeDuration > 1800) { // 30 minutes
        feedback.push({
          type: 'mood_intervention',
          priority: 'high',
          message: `You've been feeling ${currentEmotion.dominantEmotion} for a while.`,
          action: 'mood_boost_activity',
          suggestions: [
            'Call a friend or family member',
            'Watch a funny video',
            'Do a quick physical activity',
            'Write in your journal',
          ],
        });
      }
    }

    // Positive reinforcement
    if (currentEmotion.wellnessScore > 75) {
      feedback.push({
        type: 'positive_reinforcement',
        priority: 'low',
        message: 'You\'re doing great! Keep up the positive energy.',
        action: 'celebrate',
        encouragement: [
          'Your wellness score is excellent!',
          'Whatever you\'re doing, it\'s working!',
        ],
      });
    }

    // Fatigue detection (excessive blinking)
    if (currentEmotion.blinkCount > 30) {
      feedback.push({
        type: 'fatigue_alert',
        priority: 'medium',
        message: 'You may be experiencing eye strain or fatigue.',
        action: 'rest_eyes',
        instructions: [
          'Follow the 20-20-20 rule',
          'Every 20 minutes, look at something 20 feet away for 20 seconds',
          'Consider taking a screen break',
        ],
      });
    }

    return feedback;
  }

  /**
   * Generate personalized exercise based on emotion
   */
  async suggestExercise(emotion, stressLevel) {
    const exercises = {
      angry: {
        name: 'Progressive Muscle Relaxation',
        duration: 600,
        steps: [
          'Tense your fists for 5 seconds, then release',
          'Tense your arms, hold for 5 seconds, release',
          'Tense your shoulders, hold, release',
          'Continue with each muscle group',
          'Notice the difference between tension and relaxation',
        ],
      },
      sad: {
        name: 'Mood-Boosting Movement',
        duration: 300,
        steps: [
          'Stand up and stretch your arms overhead',
          'Do 10 gentle jumping jacks',
          'Dance to an upbeat song',
          'Smile (even if you don\'t feel like it)',
          'Notice any shift in your energy',
        ],
      },
      fearful: {
        name: 'Grounding Technique (5-4-3-2-1)',
        duration: 180,
        steps: [
          'Name 5 things you can see',
          'Name 4 things you can touch',
          'Name 3 things you can hear',
          'Name 2 things you can smell',
          'Name 1 thing you can taste',
        ],
      },
      neutral: {
        name: 'Mindful Breathing',
        duration: 300,
        steps: [
          'Sit comfortably with eyes closed',
          'Focus on your natural breath',
          'Count each exhale up to 10',
          'If distracted, gently return to counting',
          'Notice how you feel afterward',
        ],
      },
    };

    const exercise = exercises[emotion] || exercises.neutral;

    if (stressLevel > 70) {
      exercise.urgency = 'high';
      exercise.note = 'Your stress level is elevated. This exercise can help immediately.';
    }

    return exercise;
  }

  /**
   * Provide encouragement and motivation
   */
  async provideEncouragement(emotionTrend, achievements = []) {
    const messages = [];

    if (emotionTrend === 'improving') {
      messages.push({
        type: 'celebration',
        message: '🎉 Your emotional wellness is improving! Keep up the great work!',
        tone: 'enthusiastic',
      });
    }

    if (achievements.length > 0) {
      messages.push({
        type: 'achievement',
        message: `You've reached ${achievements.length} wellness milestones this week!`,
        achievements,
        tone: 'proud',
      });
    }

    if (emotionTrend === 'stable') {
      messages.push({
        type: 'consistency',
        message: 'Your emotions are stable. Consistency is key to wellness!',
        tone: 'supportive',
      });
    }

    if (emotionTrend === 'declining') {
      messages.push({
        type: 'support',
        message: 'Remember: difficult emotions are temporary. You\'ve got this!',
        tone: 'compassionate',
        resources: [
          'Consider reaching out to someone you trust',
          'Try one of the suggested exercises',
          'Be kind to yourself',
        ],
      });
    }

    return messages;
  }

  /**
   * Check if user needs professional help
   */
  assessCrisisRisk(emotionHistory, journalEntries = []) {
    const riskFactors = {
      prolongedSadness: false,
      highStressStreak: false,
      concerningJournal: false,
    };

    // Check for prolonged sadness (>70% sad emotions over 3 days)
    const recentEmotions = emotionHistory.slice(-100);
    const sadCount = recentEmotions.filter(e => e.dominant_emotion === 'sad').length;
    if (sadCount > 70) {
      riskFactors.prolongedSadness = true;
    }

    // Check for sustained high stress
    const highStressCount = recentEmotions.filter(e => e.stress_level > 80).length;
    if (highStressCount > 50) {
      riskFactors.highStressStreak = true;
    }

    // Check journal for concerning keywords (simplified)
    const concerningKeywords = ['hopeless', 'worthless', 'can\'t go on', 'give up'];
    journalEntries.forEach(entry => {
      if (entry.journal_text) {
        const text = entry.journal_text.toLowerCase();
        if (concerningKeywords.some(keyword => text.includes(keyword))) {
          riskFactors.concerningJournal = true;
        }
      }
    });

    const riskLevel = Object.values(riskFactors).filter(Boolean).length;

    if (riskLevel >= 2) {
      return {
        risk: 'high',
        message: 'We\'ve noticed some concerning patterns. Please consider reaching out to a mental health professional.',
        resources: [
          {
            name: 'National Suicide Prevention Lifeline',
            number: '988',
            description: '24/7 crisis support',
          },
          {
            name: 'Crisis Text Line',
            number: 'Text HOME to 741741',
            description: 'Free, 24/7 crisis support',
          },
        ],
        factors: riskFactors,
      };
    }

    if (riskLevel === 1) {
      return {
        risk: 'medium',
        message: 'Consider talking to someone about how you\'re feeling.',
        suggestion: 'A therapist or counselor can provide valuable support.',
        factors: riskFactors,
      };
    }

    return {
      risk: 'low',
      message: 'Your emotional patterns look healthy.',
      factors: riskFactors,
    };
  }

  isNegativeEmotion(emotion) {
    return ['sad', 'angry', 'fearful', 'disgusted'].includes(emotion);
  }

  isPositiveEmotion(emotion) {
    return ['happy', 'surprised'].includes(emotion);
  }
}
