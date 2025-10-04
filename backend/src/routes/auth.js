import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/queries.js';
import { validate, schemas } from '../utils/validation.js';
import { config } from '../config/config.js';
import logger from '../utils/logger.js';

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password } = validate(schemas.register, req.body);

    // Check if user exists
    const existingUser = UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = UserModel.create(username, email, passwordHash);

    logger.info('User registered', { userId: result.lastInsertRowid, email });

    res.status(201).json({
      message: 'User registered successfully',
      userId: result.lastInsertRowid
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = validate(schemas.login, req.body);

    // Find user
    const user = UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    logger.info('User logged in', { userId: user.id, email });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
