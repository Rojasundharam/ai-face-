import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { api } from '../utils/api';

const DailyReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/advanced/daily-report');
      setReport(response.data);
    } catch (error) {
      console.error('Failed to load daily report:', error);
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

  if (!report) {
    return (
      <div className="card text-center text-gray-500">
        <p>No report available for today</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="card bg-gradient-to-br from-primary-500/10 to-purple-600/10">
        <h3 className="text-2xl font-bold mb-2">
          Daily Wellness Report
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Summary */}
      <div className="card">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <span>📊</span>
          Summary
        </h4>
        <p className="text-gray-700 dark:text-gray-300">{report.summary}</p>
      </div>

      {/* Stats */}
      {report.stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="text-sm text-gray-600 dark:text-gray-400">Readings</div>
            <div className="text-2xl font-bold">{report.stats.totalReadings}</div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Wellness</div>
            <div className="text-2xl font-bold text-green-500">
              {report.stats.avgWellness?.toFixed(1) || 0}
            </div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Stress</div>
            <div className="text-2xl font-bold text-red-500">
              {report.stats.avgStress?.toFixed(1) || 0}
            </div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600 dark:text-gray-400">Top Emotion</div>
            <div className="text-xl font-bold capitalize">
              {report.stats.mostCommonEmotion}
            </div>
          </div>
        </div>
      )}

      {/* Highlights */}
      {report.highlights && report.highlights.length > 0 && (
        <div className="card bg-green-50 dark:bg-green-900/20">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <span>⭐</span>
            Highlights
          </h4>
          <ul className="space-y-2">
            {report.highlights.map((highlight, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm">{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Lowlights */}
      {report.lowlights && report.lowlights.length > 0 && (
        <div className="card bg-yellow-50 dark:bg-yellow-900/20">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <span>💭</span>
            Areas for Attention
          </h4>
          <ul className="space-y-2">
            {report.lowlights.map((lowlight, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-yellow-500">!</span>
                <span className="text-sm">{lowlight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {report.recommendations && report.recommendations.length > 0 && (
        <div className="card">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <span>💡</span>
            For Tomorrow
          </h4>
          <ul className="space-y-2">
            {report.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-primary-500">→</span>
                <span className="text-sm">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tomorrow's Forecast */}
      {report.tomorrowForecast && (
        <div className="card bg-blue-50 dark:bg-blue-900/20">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <span>🔮</span>
            Tomorrow's Outlook
          </h4>
          <p className="text-sm">{report.tomorrowForecast}</p>
        </div>
      )}

      <button
        onClick={loadReport}
        className="btn-secondary w-full"
      >
        Refresh Report
      </button>
    </motion.div>
  );
};

export default DailyReport;
