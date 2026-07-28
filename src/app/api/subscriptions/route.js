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

    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
    });

    // Map Prisma schema camelCase back to database snake_case names expected by frontend UI
    const mapped = subscriptions.map((s) => ({
      id: s.id,
      user_id: s.userId,
      domain: s.domain,
      is_active: s.isActive,
      sub_topics: s.subTopics,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Fetch subscriptions error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { userId, domain, action, isActive, subTopicName, subTopics } = await request.json();

    if (!userId || !domain) {
      return NextResponse.json({ error: 'Missing userId or domain' }, { status: 400 });
    }

    let subscription = await prisma.subscription.findUnique({
      where: {
        userId_domain: { userId, domain },
      },
    });

    if (action === 'toggle_domain') {
      if (subscription) {
        subscription = await prisma.subscription.update({
          where: { id: subscription.id },
          data: { isActive: isActive !== undefined ? isActive : !subscription.isActive },
        });
      } else {
        subscription = await prisma.subscription.create({
          data: {
            userId,
            domain,
            isActive: true,
            subTopics: [],
          },
        });
      }
    } else if (action === 'toggle_subtopic') {
      if (!subscription) {
        return NextResponse.json({ error: 'Subscription not found for subtopic toggle' }, { status: 404 });
      }

      let updatedTopics = [...(subscription.subTopics || [])];
      if (subTopics) {
        updatedTopics = subTopics;
      } else if (subTopicName) {
        updatedTopics = updatedTopics.includes(subTopicName)
          ? updatedTopics.filter((t) => t !== subTopicName)
          : [...updatedTopics, subTopicName];
      }

      subscription = await prisma.subscription.update({
        where: { id: subscription.id },
        data: { subTopics: updatedTopics },
      });
    }

    return NextResponse.json({
      id: subscription.id,
      user_id: subscription.userId,
      domain: subscription.domain,
      is_active: subscription.isActive,
      sub_topics: subscription.subTopics,
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
