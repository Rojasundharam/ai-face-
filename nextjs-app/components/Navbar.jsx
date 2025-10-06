import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useWebSocket } from '../context/WebSocketContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { isConnected } = useWebSocket();

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: '📊' },
    { to: '/analytics', label: 'Analytics', icon: '📈' },
    { to: '/journal', label: 'Journal', icon: '📝' },
    { to: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 backdrop-blur-2xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-700/50 shadow-lg"
    >
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-10">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg">
                <span className="text-2xl">🧠</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient-static">
                  AI Emotion Detection
                </h1>
                <p className="text-2xs text-slate-500 dark:text-slate-400">Professional Edition</p>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex space-x-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `group relative px-4 py-2 rounded-xl transition-all duration-300 flex items-center space-x-2 ${
                      isActive
                        ? 'text-white'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="navbar-indicator"
                          className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl shadow-lg"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <span className="relative z-10 text-lg">{link.icon}</span>
                      <span className="relative z-10 font-medium">{link.label}</span>
                      {!isActive && (
                        <div className="absolute inset-0 rounded-xl bg-slate-100 dark:bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800"
            >
              <motion.div
                animate={isConnected ? { scale: [1, 1.2, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </motion.div>

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle theme"
            >
              <span className="text-xl">{isDark ? '☀️' : '🌙'}</span>
            </motion.button>

            {/* User Menu */}
            <div className="hidden md:flex items-center space-x-3 pl-3 border-l border-slate-200 dark:border-slate-700">
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {user?.username}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {user?.email}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20 dark:hover:text-rose-400 text-sm font-medium transition-all"
              >
                Logout
              </motion.button>
            </div>

            {/* Mobile Menu Icon */}
            <button className="lg:hidden p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden flex space-x-1 pb-3 border-t border-slate-200 dark:border-slate-700 pt-3 mt-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex-1 px-3 py-2.5 rounded-xl text-center transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`
              }
            >
              <div className="text-xl mb-1">{link.icon}</div>
              <div className="text-2xs font-medium">{link.label}</div>
            </NavLink>
          ))}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
