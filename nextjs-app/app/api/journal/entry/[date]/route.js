import { NextResponse } from 'next/server';
import { JournalModel } from '@/lib/db/queries.js';
import { withAuth } from '@/lib/middleware/authMiddleware.js';
import logger from '@/lib/utils/logger.js';

async function getEntryByDate(request, { params }) {
  try {
    const { date } = params;
    const entry = JournalModel.getByDate(request.user.userId, date);

    if (!entry) {
      return NextResponse.json(
        { error: 'Journal entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ entry });
  } catch (error) {
    logger.error('Get entry by date error', { error: error.message });
    return NextResponse.json(
      { error: error.message || 'Failed to fetch entry' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getEntryByDate);
