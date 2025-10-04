import axios from 'axios';
import { config } from '../config/config.js';
import logger from '../utils/logger.js';

export class AIInsightService {
  static async generateInsight(emotionData, context = {}) {
    try {
      const prompt = this.buildPrompt(emotionData, context);

      if (config.ai.provider === 'openai') {
        return await this.getOpenAIInsight(prompt);
      } else if (config.ai.provider === 'anthropic') {
        return await this.getAnthropicInsight(prompt);
      }

      throw new Error('No AI provider configured');
    } catch (error) {
      logger.error('AI insight generation failed', { error: error.message });
      return this.getFallbackInsight(emotionData);
    }
  }

  static buildPrompt(emotionData, context) {
    const { emotions, dominantEmotion, stressLevel, wellnessScore } = emotionData;

    return `You are an empathetic AI wellness assistant. Analyze this emotional state and provide a brief, supportive insight (2-3 sentences max).

Emotions detected: ${JSON.stringify(emotions)}
Dominant emotion: ${dominantEmotion}
Stress level: ${stressLevel}/100
Wellness score: ${wellnessScore}/100
${context.recentPattern ? `Recent pattern: ${context.recentPattern}` : ''}

Provide personalized, actionable insight that is compassionate and constructive.`;
  }

  static async getOpenAIInsight(prompt) {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${config.ai.openaiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content.trim();
  }

  static async getAnthropicInsight(prompt) {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-haiku-20240307',
        max_tokens: 150,
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          'x-api-key': config.ai.anthropicKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.content[0].text.trim();
  }

  static getFallbackInsight(emotionData) {
    const { dominantEmotion, wellnessScore } = emotionData;

    const insights = {
      happy: "You're experiencing positive emotions! This is a great time to engage in activities you enjoy.",
      sad: "It's okay to feel sad. Remember that emotions are temporary. Consider reaching out to someone you trust.",
      angry: "Anger can be overwhelming. Try some deep breathing or physical activity to help process these feelings.",
      fearful: "Feeling anxious is common. Grounding techniques and mindfulness can help you feel more centered.",
      neutral: "You're in a balanced state. This is a good time for reflection or planning.",
      surprised: "Surprise can be energizing! Use this alertness constructively.",
      disgusted: "These feelings will pass. Focus on self-care and things that bring you comfort."
    };

    let insight = insights[dominantEmotion] || insights.neutral;

    if (wellnessScore < 40) {
      insight += " Your wellness score suggests you might benefit from additional support or self-care activities.";
    }

    return insight;
  }

  static async analyzeJournalEntry(journalText, moodRating) {
    try {
      const prompt = `Analyze this journal entry and provide supportive feedback (2-3 sentences):

Mood Rating: ${moodRating}/10
Entry: "${journalText}"

Provide empathetic, constructive analysis that validates their feelings and offers gentle guidance.`;

      if (config.ai.provider === 'openai') {
        return await this.getOpenAIInsight(prompt);
      } else if (config.ai.provider === 'anthropic') {
        return await this.getAnthropicInsight(prompt);
      }

      return `Thank you for sharing. Your mood rating of ${moodRating}/10 reflects how you're feeling right now, and that's valid.`;
    } catch (error) {
      logger.error('Journal analysis failed', { error: error.message });
      return `Thank you for taking time to journal. Reflecting on your feelings is an important step in emotional wellness.`;
    }
  }
}
