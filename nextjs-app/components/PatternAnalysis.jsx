import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../utils/api';

const PatternAnalysis = () => {
  const [patterns, setPatterns] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatterns();
  }, []);

  const loadPatterns = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/advanced/patterns/weekly');
      setPatterns(response.data);
    } catch (error) {
      console.error('Failed to load patterns:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="skeleton h-64 w-full"></div>
      </div>
    );
  }

  if (!patterns) {
    return (
      <div className="card text-center text-gray-500">
        <p>No patterns detected yet</p>
      </div>
    );
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'text-red-500 bg-red-50 dark:bg-red-900/20';
      case 'medium':
        return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      default:
        return 'text-green-500 bg-green-50 dark:bg-green-900/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Severity Badge */}
      <div className="card">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Weekly Pattern Analysis</h3>
          <span
            className={`px-4 py-2 rounded-full font-semibold capitalize ${getSeverityColor(
              patterns.severity
            )}`}
          >
            {patterns.severity} Severity
          </span>
        </div>

        {patterns.description && (
          <p className="mt-4 text-gray-700 dark:text-gray-300">{patterns.description}</p>
        )}
      </div>

      {/* Peak Times */}
      {patterns.peakTimes && patterns.peakTimes.length > 0 && (
        <div className="card">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <span>⏰</span>
            High Stress Times
          </h4>
          <div className="space-y-2">
            {patterns.peakTimes.map((peak, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 glass rounded-lg"
              >
                <span className="font-medium">
                  {peak.hour}:00 - {peak.hour + 1}:00
                </span>
                <span className="text-sm text-red-500">
                  Avg Stress: {peak.avgStress}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recurring Patterns */}
      {patterns.recurring && patterns.recurring.length > 0 && (
        <div className="card">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <span>🔄</span>
            Recurring Emotion Patterns
          </h4>
          <div className="space-y-2">
            {patterns.recurring.map((pattern, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 glass rounded-lg"
              >
                <div>
                  <span className="font-medium capitalize">{pattern.emotion}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({pattern.count} times)
                  </span>
                </div>
                {pattern.startTime && (
                  <span className="text-xs text-gray-500">
                    {new Date(pattern.startTime).toLocaleDateString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Triggers */}
      {patterns.triggers && patterns.triggers.length > 0 && (
        <div className="card border-l-4 border-orange-500">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <span>⚡</span>
            Detected Triggers
          </h4>
          <div className="space-y-3">
            {patterns.triggers.map((trigger, idx) => (
              <div
                key={idx}
                className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">Stress Spike</span>
                  <span className="text-xs text-gray-500">
                    +{trigger.stressIncrease} points
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {trigger.emotionChange}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(trigger.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {patterns.recommendations && patterns.recommendations.length > 0 && (
        <div className="card bg-primary-500/5">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <span>💡</span>
            Recommendations
          </h4>
          <ul className="space-y-2">
            {patterns.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-primary-500 mt-1">→</span>
                <span className="text-sm">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
};

export default PatternAnalysis;
