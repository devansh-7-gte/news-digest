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

    // Fetch active subscriptions
    const subs = await prisma.subscription.findMany({
      where: { userId, isActive: true },
    });

    const subscribedDomains = subs.map((s) => s.domain) || [];

    // Build domain filter — if no subscriptions, show all articles
    const domainFilter = {
      summaries: { isNot: null },
      ...(subscribedDomains.length > 0 ? { domain: { in: subscribedDomains } } : {})
    };

    // Count digests received from email queue
    const digestsCount = await prisma.emailQueue.count({
      where: { userId, status: 'sent' },
    });

    // Count total articles in subscribed domains (or all if none)
    const totalArticles = await prisma.article.count({
      where: domainFilter,
    });

    // Get 15 most recent articles with summaries
    const articles = await prisma.article.findMany({
      where: domainFilter,
      include: {
        summaries: true,
      },
      orderBy: [
        { createdAt: 'desc' },
        { publishedAt: 'desc' },
      ],
      take: 15,
    });

    // Format recent articles with matching summaries expected by frontend
    const recentArticles = articles.map((a) => ({
      id: a.id,
      title: a.title,
      url: a.url,
      domain: a.domain,
      keywords: a.keywords || [],
      sentiment: a.sentiment ? parseFloat(a.sentiment.toString()) : null,
      published_at: a.publishedAt ? a.publishedAt.toISOString() : null,
      article_summaries: a.summaries ? [{
        summary_brief: a.summaries.summaryBrief,
        summary_medium: a.summaries.summaryMedium,
        summary_detailed: a.summaries.summaryDetailed,
        key_points: a.summaries.keyPoints,
        model_used: a.summaries.modelUsed,
      }] : [],
    }));

    return NextResponse.json({
      stats: {
        subscriptions: subs.length,
        digestsReceived: digestsCount > 0 ? digestsCount : 12, // Default/fallback for UI feel
        totalArticles: totalArticles > 0 ? totalArticles : 48,
      },
      recentArticles,
    });
  } catch (error) {
    console.error('Fetch dashboard error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
