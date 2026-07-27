import { NextResponse } from 'next/server';
import { runEmailSenderAgent } from '@/lib/agents/email-sender';

export async function GET(request) {
  // Validate request authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('[Cron] Triggering email sender agent...');
    const sent = await runEmailSenderAgent();

    return NextResponse.json({
      success: true,
      emailsSent: sent.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Cron] Email sender failed:', error.message);
    return NextResponse.json(
      { error: 'Email sending execution failed', message: error.message },
      { status: 500 }
    );
  }
}
