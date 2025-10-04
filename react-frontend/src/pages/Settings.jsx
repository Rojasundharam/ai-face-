import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useEmotion } from '../context/EmotionContext';
import localforage from 'localforage';

const Settings = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { syncOfflineData } = useEmotion();

  const [settings, setSettings] = useState({
    notifications: true,
    autoSave: true,
    aiProvider: 'openai',
    detectionInterval: 3,
    privacyMode: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await localforage.getItem('appSettings');
      if (saved) {
        setSettings({ ...settings, ...saved });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await localforage.setItem('appSettings', newSettings);
      setSettings(newSettings);
      toast.success('Settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const handleExportData = async () => {
    try {
      const history = await localforage.getItem('emotionHistory');
      const dataStr = JSON.stringify(history, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `emotion-data-${format(new Date(), 'yyyy-MM-dd')}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const handleClearData = async () => {
    if (!confirm('Are you sure? This will clear all local data.')) return;

    try {
      await localforage.clear();
      toast.success('Local data cleared');
      window.location.reload();
    } catch (error) {
      toast.error('Failed to clear data');
    }
  };

  const handleSyncOffline = async () => {
    try {
      await syncOfflineData();
      toast.success('Offline data synced');
    } catch (error) {
      toast.error('Failed to sync data');
    }
  };

  const settingSections = [
    {
      title: 'Appearance',
      icon: '🎨',
      items: [
        {
          label: 'Dark Mode',
          type: 'toggle',
          value: isDark,
          onChange: toggleTheme,
        },
      ],
    },
    {
      title: 'Notifications',
      icon: '🔔',
      items: [
        {
          label: 'Enable Notifications',
          type: 'toggle',
          value: settings.notifications,
          onChange: (val) => saveSettings({ ...settings, notifications: val }),
        },
      ],
    },
    {
      title: 'Detection',
      icon: '📹',
      items: [
        {
          label: 'Auto-save Emotions',
          type: 'toggle',
          value: settings.autoSave,
          onChange: (val) => saveSettings({ ...settings, autoSave: val }),
        },
        {
          label: 'Detection Interval (seconds)',
          type: 'range',
          value: settings.detectionInterval,
          min: 1,
          max: 10,
          onChange: (val) => saveSettings({ ...settings, detectionInterval: val }),
        },
      ],
    },
    {
      title: 'AI & Privacy',
      icon: '🔒',
      items: [
        {
          label: 'AI Provider',
          type: 'select',
          value: settings.aiProvider,
          options: [
            { value: 'openai', label: 'OpenAI' },
            { value: 'anthropic', label: 'Anthropic' },
            { value: 'local', label: 'Local Only' },
          ],
          onChange: (val) => saveSettings({ ...settings, aiProvider: val }),
        },
        {
          label: 'Privacy Mode',
          type: 'toggle',
          value: settings.privacyMode,
          onChange: (val) => saveSettings({ ...settings, privacyMode: val }),
          description: 'Disable AI analysis and cloud sync',
        },
      ],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 max-w-4xl"
    >
      <div>
        <h1 className="text-4xl font-bold text-gradient mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Customize your experience
        </p>
      </div>

      {/* User Info */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>👤</span> Account
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Username:</span>
            <span className="font-semibold">{user?.username}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Email:</span>
            <span className="font-semibold">{user?.email}</span>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      {settingSections.map((section, idx) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="card"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>{section.icon}</span> {section.title}
          </h3>

          <div className="space-y-4">
            {section.items.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  {item.description && (
                    <div className="text-sm text-gray-500">{item.description}</div>
                  )}
                </div>

                <div className="ml-4">
                  {item.type === 'toggle' && (
                    <button
                      onClick={() => item.onChange(!item.value)}
                      className={`w-14 h-7 rounded-full transition-colors ${
                        item.value
                          ? 'bg-gradient-to-r from-primary-500 to-purple-600'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                          item.value ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  )}

                  {item.type === 'select' && (
                    <select
                      value={item.value}
                      onChange={(e) => item.onChange(e.target.value)}
                      className="input w-48"
                    >
                      {item.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {item.type === 'range' && (
                    <div className="w-48">
                      <input
                        type="range"
                        min={item.min}
                        max={item.max}
                        value={item.value}
                        onChange={(e) => item.onChange(parseInt(e.target.value))}
                        className="w-full accent-primary-500"
                      />
                      <div className="text-sm text-center font-semibold">
                        {item.value}s
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Data Management */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>💾</span> Data Management
        </h3>

        <div className="space-y-3">
          <button onClick={handleSyncOffline} className="btn-secondary w-full">
            Sync Offline Data
          </button>

          <button onClick={handleExportData} className="btn-secondary w-full">
            Export Data (JSON)
          </button>

          <button
            onClick={handleClearData}
            className="btn w-full bg-red-500 hover:bg-red-600 text-white"
          >
            Clear All Local Data
          </button>
        </div>
      </div>

      {/* About */}
      <div className="card text-center text-sm text-gray-600 dark:text-gray-400">
        <p>AI Emotion Detection v1.0.0</p>
        <p className="mt-2">
          Built with React, face-api.js, and TensorFlow.js
        </p>
        <p className="mt-2">
          🔒 Your privacy matters - all processing happens locally
        </p>
      </div>
    </motion.div>
  );
};

export default Settings;
