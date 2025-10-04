import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { api } from '../utils/api';
import { useEmotion } from '../context/EmotionContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const [timeframe, setTimeframe] = useState('week');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { loadHistory } = useEmotion();

  useEffect(() => {
    loadAnalytics();
  }, [timeframe]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [dashResponse, historyResponse] = await Promise.all([
        api.get('/api/analytics/dashboard'),
        loadHistory(timeframe),
      ]);

      setDashboardData(dashResponse.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card">
            <div className="skeleton h-64 w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="card text-center">
        <p>No analytics data available</p>
      </div>
    );
  }

  const { today, week, month, trends } = dashboardData;

  // Emotion Distribution Chart
  const emotionDistributionData = {
    labels: Object.keys(week.emotionDistribution).map(e => e.charAt(0).toUpperCase() + e.slice(1)),
    datasets: [
      {
        label: 'Emotion Distribution',
        data: Object.values(week.emotionDistribution),
        backgroundColor: [
          'rgba(252, 211, 77, 0.8)',
          'rgba(96, 165, 250, 0.8)',
          'rgba(248, 113, 113, 0.8)',
          'rgba(167, 139, 250, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(74, 222, 128, 0.8)',
          'rgba(156, 163, 175, 0.8)',
        ],
        borderColor: [
          'rgb(252, 211, 77)',
          'rgb(96, 165, 250)',
          'rgb(248, 113, 113)',
          'rgb(167, 139, 250)',
          'rgb(251, 146, 60)',
          'rgb(74, 222, 128)',
          'rgb(156, 163, 175)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Wellness Trend Chart
  const wellnessTrendData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Wellness Score',
        data: [
          week.averageWellness - 10,
          week.averageWellness - 5,
          week.averageWellness,
          week.averageWellness + (trends?.wellnessTrend || 0),
        ],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Stress Level',
        data: [
          week.averageStress + 10,
          week.averageStress + 5,
          week.averageStress,
          week.averageStress - (trends?.stressTrend || 0),
        ],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Dominant Emotions Bar Chart
  const dominantEmotionsData = {
    labels: Object.keys(week.dominantEmotions).map(e => e.charAt(0).toUpperCase() + e.slice(1)),
    datasets: [
      {
        label: 'Occurrences',
        data: Object.values(week.dominantEmotions),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 2,
      },
    ],
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gradient mb-2">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Detailed insights into your emotional patterns
          </p>
        </div>

        <div className="flex gap-2">
          {['today', 'week', 'month'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-2 rounded-xl capitalize transition-all ${
                timeframe === tf
                  ? 'bg-gradient-to-r from-primary-500 to-purple-600 text-white shadow-glow'
                  : 'glass hover:bg-white/20'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h3 className="text-lg font-semibold mb-4">Today</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Avg Wellness:</span>
              <span className="font-bold text-green-500">
                {today.averageWellness?.toFixed(1) || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Avg Stress:</span>
              <span className="font-bold text-red-500">
                {today.averageStress?.toFixed(1) || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Readings:</span>
              <span className="font-bold">{today.totalReadings || 0}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <h3 className="text-lg font-semibold mb-4">This Week</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Avg Wellness:</span>
              <span className="font-bold text-green-500">
                {week.averageWellness?.toFixed(1) || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Avg Stress:</span>
              <span className="font-bold text-red-500">
                {week.averageStress?.toFixed(1) || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Readings:</span>
              <span className="font-bold">{week.totalReadings || 0}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <h3 className="text-lg font-semibold mb-4">This Month</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Avg Wellness:</span>
              <span className="font-bold text-green-500">
                {month.averageWellness?.toFixed(1) || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Avg Stress:</span>
              <span className="font-bold text-red-500">
                {month.averageStress?.toFixed(1) || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Readings:</span>
              <span className="font-bold">{month.totalReadings || 0}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Trend Indicator */}
      {trends && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <h3 className="text-lg font-semibold mb-4">Wellness Trend</h3>
          <div className="flex items-center gap-6">
            <div
              className={`text-6xl ${
                trends.direction === 'improving' ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {trends.direction === 'improving' ? '📈' : '📉'}
            </div>
            <div>
              <div className="text-2xl font-bold capitalize">{trends.direction}</div>
              <div className="text-gray-600 dark:text-gray-400">
                {trends.wellnessTrend > 0 ? '+' : ''}
                {trends.wellnessTrend?.toFixed(1)} points
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h3 className="text-lg font-semibold mb-4">Emotion Distribution</h3>
          <Doughnut data={emotionDistributionData} options={{ maintainAspectRatio: true }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h3 className="text-lg font-semibold mb-4">Dominant Emotions</h3>
          <Bar
            data={dominantEmotionsData}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <h3 className="text-lg font-semibold mb-4">Wellness & Stress Trend</h3>
        <Line
          data={wellnessTrendData}
          options={{
            responsive: true,
            maintainAspectRatio: true,
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
              },
            },
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export default Analytics;
