import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import ParticlesBackground from './ParticlesBackground';

const Layout = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticlesBackground />
      <Navbar />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 lg:px-8 py-8 lg:py-12 relative z-10 max-w-screen-2xl"
      >
        <Outlet />
      </motion.main>

      {/* Footer */}
      <footer className="relative z-10 mt-auto py-6 border-t border-slate-200/50 dark:border-slate-700/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 lg:px-8 max-w-screen-2xl">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              © 2024 AI Emotion Detection. Built with ❤️ and AI
            </p>
            <div className="flex items-center space-x-6 text-sm text-slate-600 dark:text-slate-400">
              <span className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span>System Online</span>
              </span>
              <a href="#" className="hover:text-primary-500 transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary-500 transition-colors">Terms</a>
              <a href="#" className="hover:text-primary-500 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
