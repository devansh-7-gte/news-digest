import { prisma } from '@/lib/services/db';
import { sendDigestEmail } from '@/lib/services/resend';
import { checkRateLimit } from '@/lib/services/redis';

/**
 * Scan the email queue and dispatch scheduled pending emails.
 * Handles rate limits, error logging, and retry count increments.
 * @param {number} batchSize - Maximum emails to send in this run (default: 10)
 * @returns {Promise<Array>} List of successfully sent email queue records
 */
export async function runEmailSenderAgent(batchSize = 10) {
  console.log('[EmailSender] Starting email queue sweep...');

  // Get scheduled pending emails
  const emails = await prisma.emailQueue.findMany({
    where: {
      status: 'pending',
      scheduledFor: { lte: new Date() }
    },
    include: {
      user: {
        select: { email: true }
      }
    },
    take: batchSize,
    orderBy: { scheduledFor: 'asc' }
  });

  if (emails.length === 0) {
    console.log('[EmailSender] No pending emails to dispatch.');
    return [];
  }

  console.log(`[EmailSender] Found ${emails.length} pending emails to dispatch.`);
  const sentEmails = [];

  for (const email of emails) {
    try {
      console.log(`[EmailSender] Dispatching email ${email.id} to ${email.user.email}...`);

      // Rate limit check via Redis (100 emails/hour)
      let rateLimitPassed = true;
      const isRedisConfigured = process.env.UPSTASH_REDIS_REST_URL && 
                              !process.env.UPSTASH_REDIS_REST_URL.includes('your-upstash-url');

      if (isRedisConfigured) {
        try {
          const rateLimitResult = await checkRateLimit('email_sender', 100, 3600);
          if (!rateLimitResult.success) {
            rateLimitPassed = false;
          }
        } catch (redisError) {
          console.warn('[EmailSender] Redis rate limit check failed, bypassing:', redisError.message);
        }
      }

      if (!rateLimitPassed) {
        console.log('[EmailSender] Redis hourly rate limit reached. Postponing remaining emails.');
        break;
      }

      // Send email content via Resend
      const sendResult = await sendDigestEmail(
        email.user.email,
        email.subject,
        email.htmlContent
      );

      if (sendResult.success) {
        const updated = await prisma.emailQueue.update({
          where: { id: email.id },
          data: {
            status: 'sent',
            sentAt: new Date(),
            errorMessage: null
          }
        });
        console.log(`[EmailSender] Email ${email.id} successfully sent.`);
        sentEmails.push(updated);
      } else {
        console.error(`[EmailSender] Resend failed for email ${email.id}:`, sendResult.error);
        
        await prisma.emailQueue.update({
          where: { id: email.id },
          data: {
            status: email.retryCount >= 3 ? 'failed' : 'pending',
            errorMessage: sendResult.error,
            retryCount: { increment: 1 }
          }
        });
      }

      // Short delay between dispatches (500ms) to avoid local thread choke
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`[EmailSender] Error processing email queue record ${email.id}:`, error.message);
    }
  }

  console.log(`[EmailSender] Dispatch sweep complete. Sent ${sentEmails.length}/${emails.length} emails.`);
  return sentEmails;
}
