import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { JournalModel } from '@/lib/db/queries.js';
import { AIInsightService } from '@/lib/services/AIInsightService.js';
import { validate, schemas } from '@/lib/utils/validation.js';
import { withAuth } from '@/lib/middleware/authMiddleware.js';
import logger from '@/lib/utils/logger.js';

async function createEntry(request) {
  try {
    const formData = await request.formData();
    const date = formData.get('date');
    const moodRating = formData.get('moodRating');
    const journalText = formData.get('journalText');
    const tags = formData.get('tags');
    const photo = formData.get('photo');

    const validatedData = validate(schemas.journalEntry, {
      date: new Date(date),
      moodRating: parseInt(moodRating),
      journalText,
      tags: tags ? JSON.parse(tags) : [],
    });

    // Handle photo upload
    let photoPath = null;
    if (photo && photo.size > 0) {
      const bytes = await photo.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const filename = 'journal-' + uniqueSuffix + path.extname(photo.name);
      photoPath = path.join('uploads', 'journal', filename);

      await writeFile(photoPath, buffer);
    }

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
      userId: request.user.userId,
      date: validatedData.date.toISOString().split('T')[0],
      moodRating: validatedData.moodRating,
      journalText: validatedData.journalText,
      aiAnalysis,
      tags: validatedData.tags,
      photoPath,
    });

    logger.info('Journal entry created', {
      userId: request.user.userId,
      entryId: result.lastInsertRowid,
    });

    return NextResponse.json(
      {
        id: result.lastInsertRowid,
        aiAnalysis,
        photoPath: photoPath ? path.basename(photoPath) : null,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Create journal entry error', { error: error.message });
    return NextResponse.json(
      { error: error.message || 'Failed to create journal entry' },
      { status: 500 }
    );
  }
}

async function getEntries(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 30;
    const entries = JournalModel.getByUserId(request.user.userId, limit);

    return NextResponse.json({ entries });
  } catch (error) {
    logger.error('Get entries error', { error: error.message });
    return NextResponse.json(
      { error: error.message || 'Failed to fetch entries' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(createEntry);
export const GET = withAuth(getEntries);
