import { NextResponse } from 'next/server';
import { AIInsightService } from '@/lib/services/AIInsightService.js';
import { withAuth } from '@/lib/middleware/authMiddleware.js';
import logger from '@/lib/utils/logger.js';

async function analyzeJournal(request) {
  try {
    const body = await request.json();
    const { journalText, moodRating } = body;

    if (!journalText || !moodRating) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const analysis = await AIInsightService.analyzeJournalEntry(journalText, moodRating);

    return NextResponse.json({ analysis });
  } catch (error) {
    logger.error('Journal analysis error', { error: error.message });
    return NextResponse.json(
      { error: error.message || 'Failed to analyze journal' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(analyzeJournal);
