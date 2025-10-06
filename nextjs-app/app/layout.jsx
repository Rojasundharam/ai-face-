import './globals.css';
import { AuthProvider } from '@/components/context/AuthContext';
import { EmotionProvider } from '@/components/context/EmotionContext';
import { WebSocketProvider } from '@/components/context/WebSocketContext';
import { ThemeProvider } from '@/components/context/ThemeContext';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'AI Emotion Detection',
  description: 'Real-time emotion detection and wellness tracking',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AuthProvider>
            <WebSocketProvider>
              <EmotionProvider>
                <Toaster
                  position="top-right"
                  toastOptions={{
                    className: 'glass',
                    duration: 3000,
                  }}
                />
                {children}
              </EmotionProvider>
            </WebSocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
