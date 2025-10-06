import axios from 'axios';
import { config } from '../config/config.js';
import logger from '../utils/logger.js';

export class NotificationService {
  static async sendToN8N(data) {
    if (!config.n8n.webhookUrl) {
      logger.warn('n8n webhook URL not configured');
      return false;
    }

    try {
      await axios.post(config.n8n.webhookUrl, data, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000
      });

      logger.info('Notification sent to n8n', { type: data.type });
      return true;
    } catch (error) {
      logger.error('Failed to send n8n notification', { error: error.message });
      return false;
    }
  }

  static async notifyHighStress(userId, emotionData) {
    return await this.sendToN8N({
      type: 'high_stress_alert',
      userId,
      timestamp: new Date().toISOString(),
      stressLevel: emotionData.stressLevel,
      dominantEmotion: emotionData.dominantEmotion,
      recommendations: emotionData.recommendations
    });
  }

  static async notifyConcerningPattern(userId, pattern) {
    return await this.sendToN8N({
      type: 'concerning_pattern',
      userId,
      timestamp: new Date().toISOString(),
      pattern: pattern.pattern,
      emotion: pattern.emotion,
      frequency: pattern.frequency
    });
  }

  static async notifyDailyReport(userId, summary) {
    return await this.sendToN8N({
      type: 'daily_report',
      userId,
      date: new Date().toISOString().split('T')[0],
      summary
    });
  }
}
