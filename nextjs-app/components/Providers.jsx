'use client';

import { AuthProvider } from './context/AuthContext';
import { EmotionProvider } from './context/EmotionContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { ThemeProvider } from './context/ThemeContext';

export function Providers({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WebSocketProvider>
          <EmotionProvider>
            {children}
          </EmotionProvider>
        </WebSocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
