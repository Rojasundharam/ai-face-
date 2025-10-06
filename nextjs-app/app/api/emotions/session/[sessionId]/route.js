import { NextResponse } from 'next/server';
import { EmotionModel } from '@/lib/db/queries.js';
import { withAuth } from '@/lib/middleware/authMiddleware.js';
import logger from '@/lib/utils/logger.js';

async function getSession(request, { params }) {
  try {
    const { sessionId } = params;
    const emotions = EmotionModel.getBySessionId(sessionId);

    return NextResponse.json({ emotions });
  } catch (error) {
    logger.error('Get session error', { error: error.message });
    return NextResponse.json(
      { error: error.message || 'Failed to fetch session' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getSession);
