import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { EmotionProvider } from './context/EmotionContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Journal from './pages/Journal';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
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
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="journal" element={<Journal />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </EmotionProvider>
          </WebSocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
