import { NextResponse } from 'next/server';
import { prisma } from '@/lib/services/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const logs = await prisma.emailQueue.findMany({
      where: { userId },
      orderBy: { scheduledFor: 'desc' },
    });

    const mapped = logs.map((log) => ({
      id: log.id,
      user_id: log.userId,
      subject: log.subject,
      html_content: log.htmlContent,
      scheduled_for: log.scheduledFor ? log.scheduledFor.toISOString() : null,
      sent_at: log.sentAt ? log.sentAt.toISOString() : null,
      status: log.status,
      error_message: log.errorMessage,
      retry_count: log.retryCount,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Fetch history error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
