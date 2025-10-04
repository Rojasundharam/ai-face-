import express from 'express';
import multer from 'multer';
import path from 'path';
import { JournalModel } from '../models/queries.js';
import { AIInsightService } from '../services/AIInsightService.js';
import { validate, schemas } from '../utils/validation.js';
import { authenticateToken } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Configure multer for photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/journal/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'journal-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

router.post('/entry', authenticateToken, upload.single('photo'), async (req, res, next) => {
  try {
    const { date, moodRating, journalText, tags } = req.body;

    const validatedData = validate(schemas.journalEntry, {
      date: new Date(date),
      moodRating: parseInt(moodRating),
      journalText,
      tags: tags ? JSON.parse(tags) : []
    });

    // Get AI analysis if journal text provided
    let aiAnalysis = null;
    if (journalText && journalText.trim()) {
      try {
        aiAnalysis = await AIInsightService.analyzeJournalEntry(
          journalText,
          validatedData.moodRating
        );
      } catch (error) {
        logger.warn('Journal AI analysis failed', { error: error.message });
      }
    }

    // Save journal entry
    const result = JournalModel.create({
      userId: req.user.userId,
      date: validatedData.date.toISOString().split('T')[0],
      moodRating: validatedData.moodRating,
      journalText: validatedData.journalText,
      aiAnalysis,
      tags: validatedData.tags,
      photoPath: req.file ? req.file.path : null
    });

    logger.info('Journal entry created', {
      userId: req.user.userId,
      entryId: result.lastInsertRowid
    });

    res.status(201).json({
      id: result.lastInsertRowid,
      aiAnalysis,
      photoPath: req.file ? req.file.filename : null
    });
  } catch (error) {
    next(error);
  }
});

router.get('/entries', authenticateToken, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 30;
    const entries = JournalModel.getByUserId(req.user.userId, limit);

    res.json({ entries });
  } catch (error) {
    next(error);
  }
});

router.get('/entry/:date', authenticateToken, async (req, res, next) => {
  try {
    const { date } = req.params;
    const entry = JournalModel.getByDate(req.user.userId, date);

    if (!entry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    res.json({ entry });
  } catch (error) {
    next(error);
  }
});

export default router;
