import { NextResponse } from 'next/server';
import { prisma } from '@/lib/services/db';
import { generateDigestForUser } from '@/lib/agents/digest-generator';
import { sendDigestEmail } from '@/lib/services/resend';

export const dynamic = 'force-dynamic';

/**
 * POST /api/email/send-digest
 * Generates a real personalized digest for the userId and immediately sends it.
 * Body: { userId: string }
 */
export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Fetch user to get their email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, isActive: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    // Generate the personalized digest (creates email_queue entry with status 'pending')
    const queuedEmail = await generateDigestForUser(userId);

    if (!queuedEmail) {
      return NextResponse.json(
        { error: 'Could not generate digest. Make sure you have active subscriptions and articles with summaries.' },
        { status: 422 }
      );
    }

    // Immediately send it via Resend
    const sendResult = await sendDigestEmail(
      user.email,
      queuedEmail.subject,
      queuedEmail.htmlContent
    );

    if (!sendResult.success) {
      // Mark as failed in queue
      await prisma.emailQueue.update({
        where: { id: queuedEmail.id },
        data: { status: 'failed', errorMessage: sendResult.error },
      });
      return NextResponse.json(
        { error: 'Email send failed', detail: sendResult.error },
        { status: 500 }
      );
    }

    // Mark as sent in queue
    await prisma.emailQueue.update({
      where: { id: queuedEmail.id },
      data: { status: 'sent', sentAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      messageId: sendResult.messageId,
      sentTo: user.email,
      subject: queuedEmail.subject,
    });
  } catch (error) {
    console.error('[SendDigest] Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
