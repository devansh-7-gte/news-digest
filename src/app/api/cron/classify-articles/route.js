import { NextResponse } from 'next/server';
import { runClassifierAgent } from '@/lib/agents/classifier';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  // Validate request authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('[Cron] Triggering article classifier agent...');
    const processed = await runClassifierAgent();

    return NextResponse.json({
      success: true,
      articlesClassified: processed.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Cron] Classifier failed:', error.message);
    return NextResponse.json(
      { error: 'Classification execution failed', message: error.message },
      { status: 500 }
    );
  }
}
