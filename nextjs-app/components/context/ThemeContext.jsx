import { createContext, useContext, useState, useEffect } from 'react';
import localforage from 'localforage';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    if (!loading) {
      applyTheme(isDark);
      saveTheme(isDark);
    }
  }, [isDark, loading]);

  const loadTheme = async () => {
    try {
      const savedTheme = await localforage.getItem('theme');

      if (savedTheme !== null) {
        setIsDark(savedTheme === 'dark');
      } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDark(prefersDark);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTheme = async (dark) => {
    try {
      await localforage.setItem('theme', dark ? 'dark' : 'light');
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const applyTheme = (dark) => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        toggleTheme,
        theme: isDark ? 'dark' : 'light',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
