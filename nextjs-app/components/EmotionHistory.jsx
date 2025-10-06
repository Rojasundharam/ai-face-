import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useEmotion } from './context/EmotionContext';
import { getEmotionColor } from '../utils/faceDetection';

const EmotionHistory = ({ limit = 10 }) => {
  const { emotionHistory, loadHistory } = useEmotion();

  useEffect(() => {
    loadHistory('today');
  }, []);

  if (emotionHistory.length === 0) {
    return (
      <div className="card text-center text-gray-500">
        <p>No emotion history yet</p>
        <p className="text-sm mt-2">Start detecting to build your history</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-xl font-semibold mb-4">Recent Emotions</h3>
      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {emotionHistory.slice(0, limit).map((emotion, idx) => (
          <motion.div
            key={emotion.id || idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="glass-hover p-4 rounded-xl flex items-center justify-between"
          >
            <div className="flex items-center gap-3 flex-1">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                style={{
                  backgroundColor: `${getEmotionColor(emotion.dominant_emotion)}20`,
                  color: getEmotionColor(emotion.dominant_emotion),
                }}
              >
                {getEmotionEmoji(emotion.dominant_emotion)}
              </div>
              <div className="flex-1">
                <div className="font-semibold capitalize">
                  {emotion.dominant_emotion}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {format(new Date(emotion.timestamp), 'HH:mm:ss')}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Stress: {emotion.stress_level?.toFixed(0) || 0}
              </div>
              <div className="text-sm text-green-500 font-semibold">
                Wellness: {emotion.wellness_score?.toFixed(0) || 50}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const getEmotionEmoji = (emotion) => {
  const emojis = {
    happy: '😊',
    sad: '😢',
    angry: '😠',
    surprised: '😲',
    fearful: '😨',
    disgusted: '🤢',
    neutral: '😐',
  };
  return emojis[emotion] || '😐';
};

export default EmotionHistory;
