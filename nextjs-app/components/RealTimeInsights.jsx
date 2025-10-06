import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../utils/api';
import { useEmotion } from './context/EmotionContext';

const RealTimeInsights = () => {
  const { currentEmotion } = useEmotion();
  const [insight, setInsight] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentEmotion?.dominantEmotion) {
      fetchInsight();
    }
  }, [currentEmotion?.dominantEmotion]);

  const fetchInsight = async () => {
    if (!currentEmotion) return;

    setLoading(true);
    try {
      const response = await api.post('/api/ai/analyze-emotion', {
        emotions: currentEmotion.emotions,
        dominantEmotion: currentEmotion.dominantEmotion,
        stressLevel: currentEmotion.stressLevel || 0,
        wellnessScore: currentEmotion.wellnessScore || 50,
      });

      setInsight(response.data.insight);

      if (currentEmotion.recommendations) {
        setRecommendations(currentEmotion.recommendations);
      }
    } catch (error) {
      console.error('Failed to fetch insight:', error);
      setInsight(getFallbackInsight(currentEmotion.dominantEmotion));
    } finally {
      setLoading(false);
    }
  };

  const getFallbackInsight = (emotion) => {
    const insights = {
      happy: "You're experiencing positive emotions! Keep up whatever you're doing.",
      sad: "It's okay to feel down sometimes. Remember, emotions are temporary.",
      angry: "Take a deep breath. Try some relaxation techniques.",
      surprised: "You seem alert and engaged. Use this energy constructively!",
      fearful: "Feeling anxious is normal. Try some grounding exercises.",
      disgusted: "These feelings will pass. Focus on self-care.",
      neutral: "You're in a balanced emotional state.",
    };
    return insights[emotion] || "Keep tracking your emotions for better insights.";
  };

  if (!currentEmotion) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* AI Insight */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-br from-primary-500/10 to-purple-600/10 border border-primary-500/20"
      >
        <div className="flex items-start gap-3">
          <div className="text-3xl">🤖</div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">AI Insight</h3>
            {loading ? (
              <div className="skeleton h-16 w-full"></div>
            ) : (
              <p className="text-gray-700 dark:text-gray-300">{insight}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
          <div className="space-y-3">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl ${
                  rec.priority === 'high'
                    ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                    : rec.priority === 'medium'
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                    : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-xl">
                    {rec.priority === 'high' ? '⚠️' : rec.priority === 'medium' ? '💡' : '✅'}
                  </span>
                  <div className="flex-1">
                    <div className="font-semibold capitalize text-sm">{rec.type}</div>
                    <p className="text-sm mt-1">{rec.suggestion}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Wellness Metrics */}
      {currentEmotion.wellnessScore !== undefined && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <h3 className="text-lg font-semibold mb-4">Wellness Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Stress Level
              </div>
              <div className="text-3xl font-bold">
                {currentEmotion.stressLevel?.toFixed(0) || 0}
              </div>
              <div className="text-xs text-gray-500">/100</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Wellness Score
              </div>
              <div className="text-3xl font-bold text-green-500">
                {currentEmotion.wellnessScore?.toFixed(0) || 50}
              </div>
              <div className="text-xs text-gray-500">/100</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default RealTimeInsights;
