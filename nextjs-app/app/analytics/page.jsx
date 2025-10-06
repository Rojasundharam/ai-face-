'use client';

import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import PatternAnalysis from '@/components/PatternAnalysis';
import MoodPrediction from '@/components/MoodPrediction';
import DailyReport from '@/components/DailyReport';

export default function Analytics() {
  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8 pb-8"
      >
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            <span className="text-gradient">Analytics & Insights</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Deep dive into your emotional patterns and trends
          </p>
        </div>

        <DailyReport />
        <PatternAnalysis />
        <MoodPrediction />
      </motion.div>
    </Layout>
  );
}
