import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== Checking Users & Email Queue Status ===');

  const users = await prisma.user.findMany({
    select: { id: true, email: true, isActive: true }
  });
  console.log('Users in DB:');
  users.forEach(u => console.log(`  - [${u.id}] ${u.email} (Active: ${u.isActive})`));

  const pending = await prisma.emailQueue.findMany({
    where: { status: 'pending' },
    select: { id: true, userId: true, subject: true, status: true, errorMessage: true, retryCount: true, scheduledFor: true }
  });
  console.log(`\nPending Emails in Queue (${pending.length}):`);
  pending.forEach(e => console.log(`  - [${e.id}] Subject: "${e.subject}" | Scheduled: ${e.scheduledFor} | Retries: ${e.retryCount} | Error: ${e.errorMessage}`));

  const failed = await prisma.emailQueue.findMany({
    where: { status: 'failed' },
    select: { id: true, userId: true, subject: true, status: true, errorMessage: true }
  });
  console.log(`\nFailed Emails in Queue (${failed.length}):`);
  failed.forEach(e => console.log(`  - [${e.id}] Subject: "${e.subject}" | Error: ${e.errorMessage}`));

  const sent = await prisma.emailQueue.findMany({
    where: { status: 'sent' },
    select: { id: true, userId: true, subject: true, sentAt: true },
    orderBy: { sentAt: 'desc' },
    take: 5
  });
  console.log(`\nRecently Sent Emails (${sent.length}):`);
  sent.forEach(e => console.log(`  - [${e.id}] Subject: "${e.subject}" | SentAt: ${e.sentAt}`));
}

main().finally(() => prisma.$disconnect());
