import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { config } from './config/config.js';
import { getDatabase } from './config/database.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import logger from './utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

// Import routes
import authRoutes from './routes/auth.js';
import emotionRoutes from './routes/emotions.js';
import analyticsRoutes from './routes/analytics.js';
import aiRoutes from './routes/ai.js';
import webhookRoutes from './routes/webhook.js';
import journalRoutes from './routes/journal.js';
import advancedRoutes from './routes/advanced.js';

// Create Express app
const app = express();
const server = createServer(app);

// Initialize database
getDatabase();

// Middleware
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploaded photos
app.use('/uploads', express.static('uploads'));

// Request logging
app.use((req, res, next) => {
  logger.info('Request', { method: req.method, path: req.path, ip: req.ip });
  next();
});

// Apply rate limiting to API routes
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/emotions', emotionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/advanced', advancedRoutes);
app.use('/webhook', webhookRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// WebSocket server for real-time emotion streaming
const wss = new WebSocketServer({ server, path: '/ws' });

const clients = new Map();

wss.on('connection', (ws, req) => {
  const clientId = uuidv4();
  const sessionId = uuidv4();

  logger.info('WebSocket client connected', { clientId, sessionId });

  clients.set(clientId, { ws, sessionId, userId: null });

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.type === 'auth') {
        // Store user ID after authentication
        const client = clients.get(clientId);
        if (client) {
          client.userId = data.userId;
          clients.set(clientId, client);
        }
        ws.send(JSON.stringify({ type: 'auth_success', sessionId }));
      } else if (data.type === 'emotion_update') {
        // Broadcast emotion update to all clients for the same user
        const client = clients.get(clientId);
        if (client && client.userId) {
          clients.forEach((c, id) => {
            if (c.userId === client.userId && id !== clientId) {
              c.ws.send(JSON.stringify({
                type: 'emotion_update',
                data: data.emotion,
                timestamp: new Date().toISOString()
              }));
            }
          });
        }
      }
    } catch (error) {
      logger.error('WebSocket message error', { error: error.message, clientId });
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
    }
  });

  ws.on('close', () => {
    logger.info('WebSocket client disconnected', { clientId });
    clients.delete(clientId);
  });

  ws.on('error', (error) => {
    logger.error('WebSocket error', { error: error.message, clientId });
    clients.delete(clientId);
  });
});

// Broadcast function for sending real-time updates
export function broadcastToUser(userId, data) {
  clients.forEach((client) => {
    if (client.userId === userId && client.ws.readyState === 1) {
      client.ws.send(JSON.stringify(data));
    }
  });
}

// Start server
server.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
  console.log(`🚀 Emotion Detection API running on http://localhost:${config.port}`);
  console.log(`📊 WebSocket server available at ws://localhost:${config.port}/ws`);
  console.log(`🔧 Environment: ${config.nodeEnv}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
