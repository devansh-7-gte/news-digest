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

    const preferences = await prisma.userPreference.findUnique({
      where: { userId },
    });

    if (!preferences) {
      // Create default preferences if none exist
      const defaultPrefs = await prisma.userPreference.create({
        data: {
          userId,
          digestFrequency: 'daily',
          digestTime: '08:00:00',
          timezone: 'UTC',
          summaryLength: 'medium',
        },
      });
      return NextResponse.json({
        digest_frequency: defaultPrefs.digestFrequency,
        digest_time: defaultPrefs.digestTime,
        timezone: defaultPrefs.timezone,
        summary_length: defaultPrefs.summaryLength,
      });
    }

    return NextResponse.json({
      digest_frequency: preferences.digestFrequency,
      digest_time: preferences.digestTime,
      timezone: preferences.timezone,
      summary_length: preferences.summaryLength,
    });
  } catch (error) {
    console.error('Fetch preferences error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { userId, digest_frequency, digest_time, timezone, summary_length } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const updated = await prisma.userPreference.upsert({
      where: { userId },
      update: {
        digestFrequency: digest_frequency,
        digestTime: digest_time,
        timezone,
        summaryLength: summary_length,
      },
      create: {
        userId,
        digestFrequency: digest_frequency || 'daily',
        digestTime: digest_time || '08:00:00',
        timezone: timezone || 'UTC',
        summaryLength: summary_length || 'medium',
      },
    });

    return NextResponse.json({
      digest_frequency: updated.digestFrequency,
      digest_time: updated.digestTime,
      timezone: updated.timezone,
      summary_length: updated.summaryLength,
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
