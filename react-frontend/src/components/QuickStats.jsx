import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../utils/api';

const QuickStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.get('/api/analytics/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show default values if stats are not available yet
  const statCards = [
    {
      label: "Today's Wellness",
      value: stats.today?.averageWellness?.toFixed(0) || 0,
      icon: '💚',
      bgGradient: 'from-emerald-500/20 to-green-500/20',
      textGradient: 'from-emerald-600 to-green-600',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      suffix: '/100',
      trend: '+5%',
      trendUp: true,
    },
    {
      label: 'Stress Level',
      value: stats.today?.averageStress?.toFixed(0) || 0,
      icon: '⚡',
      bgGradient: 'from-rose-500/20 to-orange-500/20',
      textGradient: 'from-rose-600 to-orange-600',
      iconBg: 'bg-rose-100 dark:bg-rose-900/30',
      suffix: '/100',
      trend: '-2%',
      trendUp: false,
    },
    {
      label: 'Sessions Today',
      value: stats.today?.totalReadings || 0,
      icon: '📊',
      bgGradient: 'from-primary-500/20 to-accent-500/20',
      textGradient: 'from-primary-600 to-accent-600',
      iconBg: 'bg-primary-100 dark:bg-primary-900/30',
      suffix: '',
      trend: `${stats.today?.totalReadings || 0} total`,
      trendUp: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {statCards.map((stat, idx) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            delay: idx * 0.1,
            type: "spring",
            stiffness: 100
          }}
          whileHover={{ y: -5, scale: 1.02 }}
          className="relative group"
        >
          {/* Gradient Background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl`} />

          {/* Card */}
          <div className="relative stat-card">
            {loading && (
              <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl flex items-center justify-center z-10">
                <div className="skeleton h-16 w-16 rounded-full"></div>
              </div>
            )}
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.iconBg} transform group-hover:scale-110 transition-transform duration-300`}>
                <span className="text-3xl">{stat.icon}</span>
              </div>
              {stat.trendUp !== null && (
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  stat.trendUp
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300'
                }`}>
                  {stat.trendUp ? '↑' : '↓'} {stat.trend}
                </span>
              )}
            </div>

            <div>
              <p className="stat-label mb-2">{stat.label}</p>
              <div className="flex items-baseline space-x-2">
                <motion.span
                  className={`stat-value bg-gradient-to-r ${stat.textGradient} bg-clip-text text-transparent`}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.15 + 0.3 }}
                >
                  {stat.value}
                </motion.span>
                {stat.suffix && (
                  <span className="text-lg font-medium text-slate-400 dark:text-slate-500">
                    {stat.suffix}
                  </span>
                )}
              </div>
            </div>

            {/* Decorative Element */}
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity"
                 style={{ background: `linear-gradient(135deg, ${stat.textGradient})` }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default QuickStats;
