import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import { generateContentHash } from '@/lib/utils/content-hasher';
import { prisma } from '@/lib/services/db';

const rssParser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AI-News-Digest-Scraper/1.0'
  }
});

/**
 * Scrape articles from RSS feed
 * @param {string} url - RSS feed URL
 * @param {string} sourceId - Source ID
 * @returns {Promise<Array>} Array of articles
 */
async function scrapeRSSFeed(url, sourceId) {
  try {
    const feed = await rssParser.parseURL(url);
    const articles = [];

    for (const item of feed.items) {
      if (!item.link || !item.title) continue;

      const contentHash = generateContentHash(item.link);

      articles.push({
        sourceId: sourceId,
        title: item.title.trim(),
        url: item.link.trim(),
        rawContent: item.contentSnippet || item.content || item.title,
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        contentHash: contentHash,
      });
    }

    return articles;
  } catch (error) {
    console.error(`RSS scraping failed for ${url}:`, error.message);
    return [];
  }
}

/**
 * Scrape articles from web page using Cheerio HTML parsing
 * @param {string} url - Web page URL
 * @param {string} sourceId - Source ID
 * @returns {Promise<Array>} Array of articles
 */
async function scrapeWebPage(url, sourceId) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AI-News-Digest-Scraper/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const articles = [];
    const seenUrls = new Set();

    // Scrape anchor tags containing valid headlines
    $('a').each((i, el) => {
      const title = $(el).text().trim();
      let href = $(el).attr('href');

      if (!href || !title || title.length < 15) return;

      // Handle relative URLs
      if (href.startsWith('/')) {
        try {
          const baseUrl = new URL(url);
          href = `${baseUrl.origin}${href}`;
        } catch {
          return;
        }
      }

      if (href.startsWith('http') && !seenUrls.has(href)) {
        seenUrls.add(href);
        const contentHash = generateContentHash(href);
        articles.push({
          sourceId: sourceId,
          title: title,
          url: href,
          rawContent: title,
          publishedAt: new Date(),
          contentHash: contentHash,
        });
      }
    });

    return articles;
  } catch (error) {
    console.error(`Web scraping failed for ${url}:`, error.message);
    return [];
  }
}

/**
 * Run the scraper agent to fetch articles from all active sources
 * @returns {Promise<Array>} Array of scraped articles
 */
export async function runScraperAgent() {
  console.log('[ScraperAgent] Starting scrape cycle...');

  // Fetch active news sources from DB
  const sources = await prisma.newsSource.findMany({
    where: { isActive: true }
  });

  if (sources.length === 0) {
    console.log('[ScraperAgent] No active news sources found.');
    return [];
  }

  const allScrapedArticles = [];

  for (const source of sources) {
    console.log(`[ScraperAgent] Processing source: ${source.name} (${source.sourceType})`);
    let articles = [];

    if (source.sourceType === 'rss') {
      articles = await scrapeRSSFeed(source.url, source.id);
    } else if (source.sourceType === 'scrape') {
      articles = await scrapeWebPage(source.url, source.id);
    }

    if (articles.length > 0) {
      try {
        // Bulk insert raw articles, skipping duplicate URLs/hashes
        const result = await prisma.rawArticle.createMany({
          data: articles,
          skipDuplicates: true
        });

        console.log(`[ScraperAgent] Source ${source.name}: Fetched ${articles.length} links, inserted ${result.count} new articles.`);
        allScrapedArticles.push(...articles);

        // Reset error count and update last fetched timestamp
        await prisma.newsSource.update({
          where: { id: source.id },
          data: {
            lastFetchedAt: new Date(),
            errorCount: 0
          }
        });
      } catch (insertError) {
        console.error(`[ScraperAgent] DB insert failed for ${source.name}:`, insertError.message);
      }
    } else {
      console.warn(`[ScraperAgent] No articles retrieved for ${source.name}`);
      // Increment source error counter
      await prisma.newsSource.update({
        where: { id: source.id },
        data: {
          errorCount: { increment: 1 }
        }
      }).catch(() => {});
    }
  }

  console.log(`[ScraperAgent] Completed scrape cycle. Total articles processed: ${allScrapedArticles.length}`);
  return allScrapedArticles;
}
