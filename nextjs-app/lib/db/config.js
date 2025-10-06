import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-me',
    expiresIn: '7d'
  },

  ai: {
    provider: process.env.AI_PROVIDER || 'openai',
    openaiKey: process.env.OPENAI_API_KEY,
    anthropicKey: process.env.ANTHROPIC_API_KEY
  },

  n8n: {
    webhookUrl: process.env.N8N_WEBHOOK_URL
  },

  database: {
    path: process.env.DB_PATH || './emotion_detection.db'
  },

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  }
};
