import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api';
import { useEmotion } from '../context/EmotionContext';

const EmotionCoach = () => {
  const { currentEmotion } = useEmotion();
  const [feedback, setFeedback] = useState([]);
  const [activeExercise, setActiveExercise] = useState(null);
  const [exerciseTimer, setExerciseTimer] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentEmotion) {
      fetchFeedback();
    }
  }, [currentEmotion?.dominantEmotion, currentEmotion?.stressLevel]);

  const fetchFeedback = async () => {
    if (!currentEmotion) return;

    try {
      const response = await api.post('/api/advanced/coach/feedback', {
        emotionData: currentEmotion,
        context: {},
      });

      setFeedback(response.data.feedback || []);
    } catch (error) {
      console.error('Failed to fetch coaching feedback:', error);
    }
  };

  const startExercise = async (feedbackItem) => {
    setLoading(true);
    try {
      const response = await api.post('/api/advanced/coach/exercise', {
        emotion: currentEmotion.dominantEmotion,
        stressLevel: currentEmotion.stressLevel,
      });

      setActiveExercise(response.data.exercise);

      // Start timer if exercise has duration
      if (response.data.exercise.duration) {
        setExerciseTimer(response.data.exercise.duration);
        const interval = setInterval(() => {
          setExerciseTimer((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to start exercise:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
      case 'critical':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      default:
        return 'border-green-500 bg-green-50 dark:bg-green-900/20';
    }
  };

  const getActionIcon = (type) => {
    const icons = {
      breathing_exercise: '🌬️',
      wellness_boost: '💚',
      mood_intervention: '💭',
      positive_reinforcement: '🌟',
      fatigue_alert: '😴',
    };
    return icons[type] || '💡';
  };

  if (!currentEmotion) {
    return (
      <div className="card text-center text-gray-500">
        <p>Start emotion detection to receive coaching</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Active Exercise */}
      <AnimatePresence>
        {activeExercise && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="card bg-gradient-to-br from-primary-500/10 to-purple-600/10 border-2 border-primary-500"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <span>🧘</span>
                {activeExercise.name}
              </h3>
              <button
                onClick={() => setActiveExercise(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {exerciseTimer !== null && exerciseTimer > 0 && (
              <div className="mb-4">
                <div className="text-3xl font-bold text-center text-primary-500">
                  {formatTime(exerciseTimer)}
                </div>
                <div className="progress-bar mt-2">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${((activeExercise.duration - exerciseTimer) / activeExercise.duration) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-3">
              {activeExercise.steps.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <p className="text-sm">{step}</p>
                </motion.div>
              ))}
            </div>

            {activeExercise.note && (
              <div className="mt-4 p-3 glass rounded-lg text-sm">
                <strong>Note:</strong> {activeExercise.note}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coaching Feedback */}
      {feedback.length > 0 && (
        <div className="space-y-3">
          {feedback.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`card border-l-4 ${getPriorityColor(item.priority)}`}
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">{getActionIcon(item.type)}</div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{item.message}</h4>

                  {item.instructions && (
                    <ul className="text-sm space-y-1 mt-2">
                      {item.instructions.map((instruction, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-primary-500">•</span>
                          <span>{instruction}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {item.suggestions && (
                    <ul className="text-sm space-y-1 mt-2">
                      {item.suggestions.map((suggestion, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-primary-500">→</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {item.encouragement && (
                    <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                      {item.encouragement.join(' ')}
                    </div>
                  )}

                  {item.action && (
                    <button
                      onClick={() => startExercise(item)}
                      disabled={loading}
                      className="btn-primary mt-3 text-sm"
                    >
                      {loading ? 'Loading...' : 'Start Exercise'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {feedback.length === 0 && !activeExercise && (
        <div className="card text-center text-gray-500">
          <p>✨ You're doing great! No urgent coaching needed right now.</p>
        </div>
      )}
    </div>
  );
};

export default EmotionCoach;
