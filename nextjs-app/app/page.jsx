'use client';

import { motion } from 'framer-motion';
import LiveEmotionDetector from '@/components/LiveEmotionDetector';
import EmotionHistory from '@/components/EmotionHistory';
import QuickStats from '@/components/QuickStats';
import Layout from '@/components/Layout';

export default function Dashboard() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 },
    },
  };

  return (
    <Layout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8 pb-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="relative">
          <div className="absolute -top-4 -left-4 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl -z-10" />
          <div className="absolute -bottom-4 -right-4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl -z-10" />

          <div className="relative">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="inline-block">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-semibold mb-4">
                Welcome back! 👋
              </span>
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-bold mb-3">
              <span className="text-gradient">Emotion Dashboard</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
              Real-time emotion analysis and wellness insights powered by AI
            </p>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={itemVariants}>
          <QuickStats />
        </motion.div>

        {/* Live Detector */}
        <motion.div variants={itemVariants}>
          <LiveEmotionDetector />
        </motion.div>

        {/* History */}
        <motion.div variants={itemVariants}>
          <EmotionHistory />
        </motion.div>
      </motion.div>
    </Layout>
  );
}
