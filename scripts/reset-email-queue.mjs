import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetQueue() {
  const result = await prisma.emailQueue.updateMany({
    where: { status: 'failed' },
    data: {
      status: 'pending',
      retryCount: 0,
      scheduledFor: new Date(),
      errorMessage: null
    }
  });
  console.log(`Reset ${result.count} failed email queue items back to pending for immediate delivery.`);
}

resetQueue().finally(() => prisma.$disconnect());
