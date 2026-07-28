import { NextResponse } from 'next/server';
import { runSummarizerAgent } from '@/lib/agents/summarizer';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  // Validate request authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('[Cron] Triggering article summarizer agent...');
    const summaries = await runSummarizerAgent();

    return NextResponse.json({
      success: true,
      summariesCreated: summaries.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Cron] Summarizer failed:', error.message);
    return NextResponse.json(
      { error: 'Summarization execution failed', message: error.message },
      { status: 500 }
    );
  }
}
