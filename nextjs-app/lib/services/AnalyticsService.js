import { EmotionModel } from '../models/queries.js';

export class AnalyticsService {
  static calculateTimeframeStats(emotionReadings) {
    if (emotionReadings.length === 0) {
      return {
        averageStress: 0,
        averageWellness: 0,
        dominantEmotions: {},
        emotionDistribution: {}
      };
    }

    let totalStress = 0;
    let totalWellness = 0;
    const emotionCounts = {};
    const emotionTotals = {};

    emotionReadings.forEach(reading => {
      totalStress += reading.stress_level;
      totalWellness += reading.wellness_score;

      emotionCounts[reading.dominant_emotion] =
        (emotionCounts[reading.dominant_emotion] || 0) + 1;

      const emotions = JSON.parse(reading.emotions);
      Object.entries(emotions).forEach(([emotion, value]) => {
        emotionTotals[emotion] = (emotionTotals[emotion] || 0) + value;
      });
    });

    const count = emotionReadings.length;
    const emotionDistribution = {};
    Object.entries(emotionTotals).forEach(([emotion, total]) => {
      emotionDistribution[emotion] = total / count;
    });

    return {
      averageStress: totalStress / count,
      averageWellness: totalWellness / count,
      dominantEmotions: emotionCounts,
      emotionDistribution,
      totalReadings: count
    };
  }

  static async getDashboardData(userId) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [todayData, weekData, monthData] = await Promise.all([
      EmotionModel.getByTimeframe(userId, today.toISOString(), now.toISOString()),
      EmotionModel.getByTimeframe(userId, weekAgo.toISOString(), now.toISOString()),
      EmotionModel.getByTimeframe(userId, monthAgo.toISOString(), now.toISOString())
    ]);

    return {
      today: this.calculateTimeframeStats(todayData),
      week: this.calculateTimeframeStats(weekData),
      month: this.calculateTimeframeStats(monthData),
      trends: this.calculateTrends(weekData)
    };
  }

  static calculateTrends(emotionReadings) {
    if (emotionReadings.length < 2) return null;

    // Split into two halves and compare
    const midpoint = Math.floor(emotionReadings.length / 2);
    const firstHalf = emotionReadings.slice(0, midpoint);
    const secondHalf = emotionReadings.slice(midpoint);

    const firstStats = this.calculateTimeframeStats(firstHalf);
    const secondStats = this.calculateTimeframeStats(secondHalf);

    return {
      stressTrend: secondStats.averageStress - firstStats.averageStress,
      wellnessTrend: secondStats.averageWellness - firstStats.averageWellness,
      direction: secondStats.averageWellness > firstStats.averageWellness ? 'improving' : 'declining'
    };
  }

  static generateReport(dashboardData) {
    const { today, week, month, trends } = dashboardData;

    let report = `Emotional Wellness Report\n\n`;

    report += `Today's Summary:\n`;
    report += `- Average Stress: ${today.averageStress.toFixed(1)}/100\n`;
    report += `- Average Wellness: ${today.averageWellness.toFixed(1)}/100\n`;
    report += `- Total Readings: ${today.totalReadings}\n\n`;

    report += `Weekly Summary:\n`;
    report += `- Average Stress: ${week.averageStress.toFixed(1)}/100\n`;
    report += `- Average Wellness: ${week.averageWellness.toFixed(1)}/100\n`;
    report += `- Most Common Emotion: ${this.getTopEmotion(week.dominantEmotions)}\n\n`;

    if (trends) {
      report += `Trend: Your wellness is ${trends.direction}\n`;
      report += `Wellness change: ${trends.wellnessTrend > 0 ? '+' : ''}${trends.wellnessTrend.toFixed(1)}\n`;
    }

    return report;
  }

  static getTopEmotion(emotionCounts) {
    if (Object.keys(emotionCounts).length === 0) return 'none';
    return Object.entries(emotionCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  }
}
