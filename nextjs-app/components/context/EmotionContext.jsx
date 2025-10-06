import { createContext, useContext, useState, useCallback } from 'react';
import localforage from 'localforage';
import { api } from '../utils/api';

const EmotionContext = createContext();

export const useEmotion = () => {
  const context = useContext(EmotionContext);
  if (!context) throw new Error('useEmotion must be used within EmotionProvider');
  return context;
};

export const EmotionProvider = ({ children }) => {
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  const startSession = useCallback(() => {
    const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
    setIsRecording(true);
    return newSessionId;
  }, []);

  const endSession = useCallback(() => {
    setSessionId(null);
    setIsRecording(false);
  }, []);

  const recordEmotion = useCallback(async (emotionData) => {
    try {
      // Save to backend
      const response = await api.post('/api/emotions/record', {
        emotions: emotionData.emotions,
        blinkCount: emotionData.blinkCount || 0,
        sessionId: sessionId,
      });

      const savedEmotion = response.data;
      setCurrentEmotion(savedEmotion);
      setEmotionHistory(prev => [savedEmotion, ...prev.slice(0, 99)]);

      // Save to local storage for offline access
      const localHistory = await localforage.getItem('emotionHistory') || [];
      await localforage.setItem('emotionHistory', [savedEmotion, ...localHistory.slice(0, 999)]);

      return savedEmotion;
    } catch (error) {
      console.error('Failed to record emotion:', error);

      // Offline fallback
      const offlineEmotion = {
        ...emotionData,
        timestamp: new Date().toISOString(),
        offline: true,
      };

      setCurrentEmotion(offlineEmotion);
      setEmotionHistory(prev => [offlineEmotion, ...prev.slice(0, 99)]);

      const offlineQueue = await localforage.getItem('offlineEmotions') || [];
      await localforage.setItem('offlineEmotions', [...offlineQueue, offlineEmotion]);

      return offlineEmotion;
    }
  }, [sessionId]);

  const loadHistory = useCallback(async (timeframe = 'week') => {
    try {
      const response = await api.get(`/api/emotions/history/${timeframe}`);
      setEmotionHistory(response.data.emotions);
      return response.data.emotions;
    } catch (error) {
      console.error('Failed to load history:', error);

      // Load from local storage
      const localHistory = await localforage.getItem('emotionHistory') || [];
      setEmotionHistory(localHistory);
      return localHistory;
    }
  }, []);

  const syncOfflineData = useCallback(async () => {
    try {
      const offlineQueue = await localforage.getItem('offlineEmotions') || [];

      if (offlineQueue.length === 0) return;

      for (const emotion of offlineQueue) {
        try {
          await api.post('/api/emotions/record', emotion);
        } catch (err) {
          console.error('Failed to sync emotion:', err);
        }
      }

      await localforage.removeItem('offlineEmotions');
    } catch (error) {
      console.error('Failed to sync offline data:', error);
    }
  }, []);

  return (
    <EmotionContext.Provider
      value={{
        currentEmotion,
        emotionHistory,
        sessionId,
        isRecording,
        setCurrentEmotion,
        startSession,
        endSession,
        recordEmotion,
        loadHistory,
        syncOfflineData,
      }}
    >
      {children}
    </EmotionContext.Provider>
  );
};
