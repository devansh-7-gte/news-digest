import { NextResponse } from 'next/server';
import { prisma } from '@/lib/services/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain') || 'all';

    // Fetch active sources
    const sources = await prisma.newsSource.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    const newsSources = sources.map((s) => ({
      id: s.id,
      name: s.name,
      domain: s.domain,
      source_type: s.sourceType,
      url: s.url,
      is_active: s.isActive,
      last_fetched_at: s.lastFetchedAt ? s.lastFetchedAt.toISOString() : null,
      error_count: s.errorCount,
    }));

    // Build articles query — prioritize articles that have summaries
    const where = {
      summaries: { isNot: null },
    };
    if (domain !== 'all') {
      where.domain = domain;
    }

    const articles = await prisma.article.findMany({
      where,
      include: {
        summaries: true,
      },
      orderBy: [
        { createdAt: 'desc' },
        { publishedAt: 'desc' },
      ],
      take: 35,
    });

    const formattedArticles = articles.map((a) => ({
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
      newsSources,
      articles: formattedArticles,
    });
  } catch (error) {
    console.error('Fetch sources error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
