import { NextResponse } from 'next/server';
import { runScraperAgent } from '@/lib/agents/scraper';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  // Validate request authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('[Cron] Triggering news scraper agent...');
    const articles = await runScraperAgent();

    return NextResponse.json({
      success: true,
      articlesScraped: articles.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Cron] Scraper failed:', error.message);
    return NextResponse.json(
      { error: 'Scraper execution failed', message: error.message },
      { status: 500 }
    );
  }
}
