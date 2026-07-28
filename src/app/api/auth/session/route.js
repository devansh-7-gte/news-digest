import { NextResponse } from 'next/server';
import { prisma } from '@/lib/services/db';

export async function POST(request) {
  try {
    const { email, userId } = await request.json();

    if (!email || !userId) {
      return NextResponse.json({ error: 'Missing email or userId' }, { status: 400 });
    }

    // Check if user exists in the Prisma DB
    let userObj = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userObj) {
      // Create user and default preferences
      userObj = await prisma.user.create({
        data: {
          id: userId,
          email,
          preferences: {
            create: {
              digestFrequency: 'daily',
              digestTime: '08:00:00',
              timezone: 'UTC',
              summaryLength: 'medium',
            },
          },
        },
      });

      // Seed default active subscriptions
      await prisma.subscription.createMany({
        data: [
          { userId: userId, domain: 'technology', isActive: true, subTopics: ['Software Engineering', 'AI & Machine Learning'] },
          { userId: userId, domain: 'finance', isActive: true, subTopics: ['Stock Market'] },
        ],
        skipDuplicates: true,
      });
    } else if (userObj.email !== email) {
      userObj = await prisma.user.update({
        where: { id: userId },
        data: { email },
      });
    }

    return NextResponse.json({ success: true, user: userObj });
  } catch (error) {
    console.error('Session ensure error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
