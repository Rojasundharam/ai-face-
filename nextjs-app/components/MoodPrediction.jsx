import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../utils/api';

const MoodPrediction = () => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoursAhead, setHoursAhead] = useState(4);

  useEffect(() => {
    loadPrediction();
  }, [hoursAhead]);

  const loadPrediction = async () => {
    setLoading(true);
    try {
      const response = await api.post('/api/advanced/predict-mood', { hoursAhead });
      setPrediction(response.data);
    } catch (error) {
      console.error('Failed to load prediction:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="skeleton h-32 w-full"></div>
      </div>
    );
  }

  if (!prediction || !prediction.aiPrediction) {
    return (
      <div className="card text-center text-gray-500">
        <p>Not enough data for mood prediction</p>
        <p className="text-sm mt-2">Keep tracking to see predictions!</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card bg-gradient-to-br from-purple-500/10 to-blue-600/10"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span>🔮</span>
          Mood Prediction
        </h3>

        <select
          value={hoursAhead}
          onChange={(e) => setHoursAhead(parseInt(e.target.value))}
          className="input text-sm py-1"
        >
          <option value={2}>2 hours</option>
          <option value={4}>4 hours</option>
          <option value={6}>6 hours</option>
          <option value={12}>12 hours</option>
        </select>
      </div>

      <div className="space-y-4">
        {/* AI Prediction */}
        <div className="glass p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🤖</span>
            <span className="font-semibold">AI Forecast</span>
          </div>
          <p className="text-sm">{prediction.aiPrediction}</p>
        </div>

        {/* Confidence Score */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Confidence:</span>
          <div className="flex items-center gap-2">
            <div className="w-32 progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${prediction.confidence}%` }}
              />
            </div>
            <span className="text-sm font-bold">{prediction.confidence}%</span>
          </div>
        </div>

        {/* Trend Indicator */}
        <div className="flex items-center justify-between glass p-3 rounded-lg">
          <span className="text-sm font-medium">Current Trend:</span>
          <div className="flex items-center gap-2">
            <span className="capitalize font-semibold">
              {prediction.trend}
            </span>
            {prediction.trend === 'improving' && <span className="text-green-500">📈</span>}
            {prediction.trend === 'declining' && <span className="text-red-500">📉</span>}
            {prediction.trend === 'stable' && <span className="text-blue-500">➡️</span>}
          </div>
        </div>

        {/* Advice */}
        {prediction.advice && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm">
            <strong>Advice:</strong> {prediction.advice}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="glass p-3 rounded-lg">
            <div className="text-gray-600 dark:text-gray-400">Avg Wellness</div>
            <div className="text-lg font-bold text-green-500">
              {prediction.avgWellness}
            </div>
          </div>
          <div className="glass p-3 rounded-lg">
            <div className="text-gray-600 dark:text-gray-400">Avg Stress</div>
            <div className="text-lg font-bold text-red-500">
              {prediction.avgStress}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MoodPrediction;
