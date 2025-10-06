import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import express from 'express';
import logger from './lib/utils/logger.js';

dotenv.config({ path: '.env.local' });

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Initialize Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// WebSocket clients management
const clients = new Map();

// Broadcast function for sending real-time updates
export function broadcastToUser(userId, data) {
  clients.forEach((client) => {
    if (client.userId === userId && client.ws.readyState === 1) {
      client.ws.send(JSON.stringify(data));
    }
  });
}

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);

      // Handle static file serving for uploads
      if (parsedUrl.pathname.startsWith('/uploads')) {
        const expressApp = express();
        expressApp.use('/uploads', express.static('uploads'));
        expressApp(req, res);
      } else {
        await handle(req, res, parsedUrl);
      }
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // WebSocket server for real-time emotion streaming
  const wss = new WebSocketServer({ server, path: '/ws' });

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
                c.ws.send(
                  JSON.stringify({
                    type: 'emotion_update',
                    data: data.emotion,
                    timestamp: new Date().toISOString(),
                  })
                );
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

  server.listen(port, (err) => {
    if (err) throw err;
    logger.info(`Server running on port ${port}`);
    console.log(`🚀 Emotion Detection App running on http://${hostname}:${port}`);
    console.log(`📊 WebSocket server available at ws://${hostname}:${port}/ws`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });
});
