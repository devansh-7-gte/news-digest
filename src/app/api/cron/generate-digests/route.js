import { NextResponse } from 'next/server';
import { runDigestGeneratorAgent } from '@/lib/agents/digest-generator';

export async function GET(request) {
  // Validate request authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('[Cron] Triggering digest generator agent...');
    const digests = await runDigestGeneratorAgent();

    return NextResponse.json({
      success: true,
      digestsGenerated: digests.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Cron] Digest generator failed:', error.message);
    return NextResponse.json(
      { error: 'Digest generation execution failed', message: error.message },
      { status: 500 }
    );
  }
}
