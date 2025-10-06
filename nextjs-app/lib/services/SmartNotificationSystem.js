import { NotificationService } from './NotificationService.js';
import { EmotionCoach } from './EmotionCoach.js';
import logger from '../utils/logger.js';

export class SmartNotificationSystem {
  constructor() {
    this.notificationService = new NotificationService();
    this.emotionCoach = new EmotionCoach();
    this.userPreferences = new Map();
    this.sentNotifications = new Map();
  }

  /**
   * Set user notification preferences
   */
  setUserPreferences(userId, preferences) {
    this.userPreferences.set(userId, {
      enabled: preferences.enabled !== false,
      channels: preferences.channels || ['in_app', 'webhook'],
      quietHours: preferences.quietHours || { start: 22, end: 7 },
      frequency: preferences.frequency || 'normal', // low, normal, high
      types: preferences.types || {
        stress_alerts: true,
        wellness_tips: true,
        achievements: true,
        daily_summary: true,
        crisis_support: true,
      },
    });
  }

  /**
   * Get user preferences
   */
  getUserPreferences(userId) {
    return this.userPreferences.get(userId) || {
      enabled: true,
      channels: ['in_app'],
      quietHours: { start: 22, end: 7 },
      frequency: 'normal',
      types: {
        stress_alerts: true,
        wellness_tips: true,
        achievements: true,
        daily_summary: true,
        crisis_support: true,
      },
    };
  }

  /**
   * Process emotion reading and send smart notifications
   */
  async processEmotionReading(userId, emotionData, context = {}) {
    const prefs = this.getUserPreferences(userId);

    if (!prefs.enabled || this.isQuietHours(prefs.quietHours)) {
      return { notifications: [] };
    }

    const notifications = [];

    // Get live coaching feedback
    const feedback = await this.emotionCoach.provideLiveFeedback(emotionData, context);

    // Process each feedback item
    for (const item of feedback) {
      if (this.shouldSendNotification(userId, item, prefs)) {
        const notification = await this.createNotification(userId, item, emotionData);
        notifications.push(notification);

        // Send via configured channels
        await this.sendNotification(userId, notification, prefs.channels);
      }
    }

    return { notifications };
  }

  /**
   * Send daily summary notification
   */
  async sendDailySummary(userId, summary) {
    const prefs = this.getUserPreferences(userId);

    if (!prefs.enabled || !prefs.types.daily_summary) {
      return;
    }

    const notification = {
      type: 'daily_summary',
      title: 'Your Daily Emotional Wellness Summary',
      message: summary.summary,
      data: {
        avgWellness: summary.stats.avgWellness,
        avgStress: summary.stats.avgStress,
        highlights: summary.highlights,
        recommendations: summary.recommendations,
      },
      priority: 'low',
      timestamp: new Date(),
    };

    await this.sendNotification(userId, notification, prefs.channels);
  }

  /**
   * Send achievement notification
   */
  async sendAchievement(userId, achievement) {
    const prefs = this.getUserPreferences(userId);

    if (!prefs.enabled || !prefs.types.achievements) {
      return;
    }

    const notification = {
      type: 'achievement',
      title: '🎉 Achievement Unlocked!',
      message: achievement.message,
      data: achievement,
      priority: 'low',
      timestamp: new Date(),
    };

    await this.sendNotification(userId, notification, prefs.channels);
  }

  /**
   * Send wellness tip
   */
  async sendWellnessTip(userId, tip) {
    const prefs = this.getUserPreferences(userId);

    if (!prefs.enabled || !prefs.types.wellness_tips) {
      return;
    }

    if (!this.canSendWellnessTip(userId, prefs.frequency)) {
      return;
    }

    const notification = {
      type: 'wellness_tip',
      title: '💡 Wellness Tip',
      message: tip.message,
      data: tip,
      priority: 'low',
      timestamp: new Date(),
    };

    await this.sendNotification(userId, notification, prefs.channels);
    this.recordSentNotification(userId, 'wellness_tip');
  }

  /**
   * Send crisis support notification
   */
  async sendCrisisSupport(userId, riskAssessment) {
    const prefs = this.getUserPreferences(userId);

    if (!prefs.enabled || !prefs.types.crisis_support) {
      return;
    }

    const notification = {
      type: 'crisis_support',
      title: '💜 Support Available',
      message: riskAssessment.message,
      data: {
        resources: riskAssessment.resources,
        riskLevel: riskAssessment.risk,
      },
      priority: 'critical',
      timestamp: new Date(),
    };

    // Always send crisis notifications regardless of quiet hours
    await this.sendNotification(userId, notification, prefs.channels);
  }

  /**
   * Send pattern alert
   */
  async sendPatternAlert(userId, pattern) {
    const prefs = this.getUserPreferences(userId);

    if (!prefs.enabled) {
      return;
    }

    const notification = {
      type: 'pattern_alert',
      title: '📊 Emotional Pattern Detected',
      message: pattern.description,
      data: {
        pattern: pattern.pattern,
        severity: pattern.severity,
        recommendations: pattern.recommendations,
      },
      priority: pattern.severity === 'high' ? 'high' : 'medium',
      timestamp: new Date(),
    };

    await this.sendNotification(userId, notification, prefs.channels);
  }

  // ===== Helper Methods =====

  async createNotification(userId, feedbackItem, emotionData) {
    return {
      type: feedbackItem.type,
      title: this.getNotificationTitle(feedbackItem.type),
      message: feedbackItem.message,
      data: {
        ...feedbackItem,
        emotionSnapshot: {
          dominantEmotion: emotionData.dominantEmotion,
          stressLevel: emotionData.stressLevel,
          wellnessScore: emotionData.wellnessScore,
        },
      },
      priority: feedbackItem.priority,
      timestamp: new Date(),
    };
  }

  async sendNotification(userId, notification, channels) {
    for (const channel of channels) {
      try {
        if (channel === 'webhook' || channel === 'n8n') {
          await NotificationService.sendToN8N({
            userId,
            notification,
            timestamp: new Date().toISOString(),
          });
        }

        // In-app notifications would be handled via WebSocket in real implementation
        if (channel === 'in_app') {
          logger.info('In-app notification queued', {
            userId,
            type: notification.type,
          });
        }

        // Email/SMS would be handled by external services
        if (channel === 'email') {
          // Integration with email service
        }

        if (channel === 'sms') {
          // Integration with SMS service
        }
      } catch (error) {
        logger.error('Failed to send notification', {
          userId,
          channel,
          error: error.message,
        });
      }
    }
  }

  shouldSendNotification(userId, feedbackItem, prefs) {
    // Check if notification type is enabled
    const typeMapping = {
      breathing_exercise: 'stress_alerts',
      wellness_boost: 'wellness_tips',
      mood_intervention: 'stress_alerts',
      fatigue_alert: 'wellness_tips',
    };

    const typeKey = typeMapping[feedbackItem.type];
    if (typeKey && !prefs.types[typeKey]) {
      return false;
    }

    // Check if we've sent too many notifications recently
    if (feedbackItem.priority !== 'high' && feedbackItem.priority !== 'critical') {
      return this.checkRateLimit(userId, feedbackItem.type, prefs.frequency);
    }

    return true;
  }

  checkRateLimit(userId, notificationType, frequency) {
    const key = `${userId}-${notificationType}`;
    const lastSent = this.sentNotifications.get(key);

    if (!lastSent) {
      return true;
    }

    const minInterval = {
      low: 3600000, // 1 hour
      normal: 1800000, // 30 minutes
      high: 900000, // 15 minutes
    };

    const interval = minInterval[frequency] || minInterval.normal;
    const timeSinceLastSent = Date.now() - lastSent;

    return timeSinceLastSent >= interval;
  }

  recordSentNotification(userId, notificationType) {
    const key = `${userId}-${notificationType}`;
    this.sentNotifications.set(key, Date.now());

    // Clean up old records (older than 24 hours)
    setTimeout(() => {
      const now = Date.now();
      for (const [k, timestamp] of this.sentNotifications.entries()) {
        if (now - timestamp > 86400000) {
          this.sentNotifications.delete(k);
        }
      }
    }, 3600000); // Run cleanup every hour
  }

  canSendWellnessTip(userId, frequency) {
    const frequencies = {
      low: 1, // 1 per day
      normal: 3, // 3 per day
      high: 6, // 6 per day
    };

    const maxPerDay = frequencies[frequency] || frequencies.normal;
    const todayKey = `${userId}-wellness_tip-${new Date().toDateString()}`;

    const count = this.sentNotifications.get(todayKey) || 0;

    if (count >= maxPerDay) {
      return false;
    }

    this.sentNotifications.set(todayKey, count + 1);
    return true;
  }

  isQuietHours(quietHours) {
    const now = new Date().getHours();
    const { start, end } = quietHours;

    if (start < end) {
      return now >= start && now < end;
    } else {
      // Handle overnight quiet hours (e.g., 22:00 - 07:00)
      return now >= start || now < end;
    }
  }

  getNotificationTitle(type) {
    const titles = {
      breathing_exercise: '🌬️ Breathing Exercise',
      wellness_boost: '💚 Wellness Boost',
      mood_intervention: '💭 Mood Check',
      positive_reinforcement: '🌟 Keep Going!',
      fatigue_alert: '😴 Rest Reminder',
      stress_alert: '⚠️ Stress Alert',
      achievement: '🎉 Achievement',
      daily_summary: '📊 Daily Summary',
      wellness_tip: '💡 Wellness Tip',
      crisis_support: '💜 Support Available',
      pattern_alert: '📊 Pattern Detected',
    };

    return titles[type] || '📬 Notification';
  }

  /**
   * Generate smart reminder based on user behavior
   */
  async generateSmartReminder(userId, userActivity) {
    const prefs = this.getUserPreferences(userId);

    if (!prefs.enabled) {
      return null;
    }

    const reminders = [];

    // Reminder to check in if no activity in 24 hours
    if (userActivity.lastEmotionCheck) {
      const hoursSinceLastCheck = (Date.now() - userActivity.lastEmotionCheck) / 3600000;

      if (hoursSinceLastCheck > 24) {
        reminders.push({
          type: 'check_in',
          message: 'Haven\'t seen you today! How are you feeling?',
          priority: 'low',
        });
      }
    }

    // Reminder to journal if user journals regularly
    if (userActivity.journalStreak && userActivity.journalStreak > 3) {
      const hoursSinceLastJournal = (Date.now() - userActivity.lastJournalEntry) / 3600000;

      if (hoursSinceLastJournal > 20 && hoursSinceLastJournal < 28) {
        reminders.push({
          type: 'journal_reminder',
          message: `You're on a ${userActivity.journalStreak}-day journal streak! Don't break it!`,
          priority: 'low',
        });
      }
    }

    return reminders;
  }
}

// Singleton instance
export const smartNotificationSystem = new SmartNotificationSystem();
