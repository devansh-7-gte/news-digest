import { prisma } from '@/lib/services/db';
import { classifyArticle } from '@/lib/services/gemini';

const DOMAIN_KEYWORDS = {
  technology: ['ai', 'tech', 'software', 'app', 'google', 'apple', 'microsoft', 'startup', 'cloud', 'cyber', 'data', 'robot', 'chip', 'gpu', 'semiconductor', 'code', 'developer', 'programming', 'openai', 'chatgpt', 'gemini', 'wired', 'techcrunch', 'etf'],
  finance: ['stock', 'market', 'invest', 'bank', 'crypto', 'bitcoin', 'ethereum', 'dollar', 'economy', 'gdp', 'fed', 'interest rate', 'revenue', 'profit', 'ipo', 'wall street', 'nasdaq', 'dow', 'finance', 'trading', 'bond', 'inflation', 'earnings', 'credit card'],
  health: ['health', 'medical', 'doctor', 'hospital', 'vaccine', 'virus', 'disease', 'drug', 'pharma', 'biotech', 'fda', 'clinical', 'patient', 'surgery', 'cancer', 'mental health', 'wellness', 'fitness', 'nutrition'],
  politics: ['politic', 'election', 'president', 'congress', 'senate', 'parliament', 'government', 'policy', 'law', 'legislation', 'diplomat', 'war', 'military', 'sanction', 'nato', 'un', 'vote', 'democrat', 'republican', 'trump', 'biden'],
  sports: ['sport', 'game', 'player', 'team', 'score', 'championship', 'league', 'nba', 'nfl', 'mlb', 'soccer', 'football', 'basketball', 'tennis', 'golf', 'coach', 'draft', 'espn', 'match', 'tournament', 'olympic']
};

function fallbackClassifyText(title, content, defaultDomain = 'technology') {
  const text = `${title} ${content || ''}`.toLowerCase();
  let bestDomain = defaultDomain || 'technology';
  let bestScore = 0;

  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (text.includes(kw)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestDomain = domain;
    }
  }

  const words = title.split(/\s+/).filter(w => w.length > 3).map(w => w.replace(/[^a-zA-Z]/g, '')).filter(Boolean);
  const keywords = [...new Set(words)].slice(0, 5);

  return {
    domain: bestDomain,
    subTopics: [bestDomain.charAt(0).toUpperCase() + bestDomain.slice(1)],
    sentiment: 0.2,
    keywords
  };
}

/**
 * Run the classifier agent to process raw scraped articles and categorize them.
 * Processes unprocessed RawArticles in batches.
 * @param {number} batchSize - Number of articles to process in this run (default: 15)
 * @returns {Promise<Array>} Array of successfully classified Article records
 */
export async function runClassifierAgent(batchSize = 15) {
  console.log('[ClassifierAgent] Starting classification cycle...');

  // Get raw articles that haven't been processed yet
  const rawArticles = await prisma.rawArticle.findMany({
    where: { isProcessed: false },
    include: { source: true },
    take: batchSize,
    orderBy: { fetchedAt: 'desc' }
  });

  if (rawArticles.length === 0) {
    console.log('[ClassifierAgent] No unprocessed raw articles found.');
    return [];
  }

  console.log(`[ClassifierAgent] Found ${rawArticles.length} raw articles to process.`);
  const processedArticles = [];

  for (const rawArticle of rawArticles) {
    try {
      console.log(`[ClassifierAgent] Classifying: "${rawArticle.title}" (ID: ${rawArticle.id})`);

      const contentToClassify = rawArticle.rawContent && rawArticle.rawContent.length > 50
        ? rawArticle.rawContent.slice(0, 400)
        : rawArticle.title;

      const sourceDomain = rawArticle.source?.domain || null;

      let classification;
      try {
        classification = await classifyArticle(rawArticle.title, contentToClassify, sourceDomain);
      } catch (geminiError) {
        console.warn(`[ClassifierAgent] Gemini API unavailable (${geminiError.message}). Using offline fallback classification for "${rawArticle.title}"`);
        classification = fallbackClassifyText(rawArticle.title, contentToClassify, sourceDomain);
      }

      const validDomains = ['finance', 'technology', 'health', 'politics', 'sports'];
      const domain = classification.domain && validDomains.includes(classification.domain.toLowerCase())
        ? classification.domain.toLowerCase()
        : (sourceDomain || 'technology');

      const existingArticle = await prisma.article.findUnique({
        where: { url: rawArticle.url }
      });

      let article;
      const articleData = {
        rawArticleId: rawArticle.id,
        title: rawArticle.title.trim(),
        domain: domain,
        subTopics: classification.subTopics || [],
        sentiment: classification.sentiment !== undefined ? parseFloat(classification.sentiment) : 0.0,
        keywords: classification.keywords || [],
        publishedAt: rawArticle.publishedAt || new Date()
      };

      if (existingArticle) {
        article = await prisma.article.update({
          where: { id: existingArticle.id },
          data: articleData
        });
        console.log(`[ClassifierAgent] Updated existing processed article: ${article.id}`);
      } else {
        article = await prisma.article.create({
          data: {
            ...articleData,
            url: rawArticle.url
          }
        });
        console.log(`[ClassifierAgent] Created new processed article: ${article.id}`);
      }

      await prisma.rawArticle.update({
        where: { id: rawArticle.id },
        data: { isProcessed: true }
      });

      processedArticles.push(article);
    } catch (error) {
      console.error(`[ClassifierAgent] Failed to process raw article ${rawArticle.id}:`, error.message);
      // Mark as processed so broken articles don't block the queue forever
      await prisma.rawArticle.update({
        where: { id: rawArticle.id },
        data: { isProcessed: true }
      }).catch(() => {});
    }
  }

  console.log(`[ClassifierAgent] Classification cycle complete. Processed ${processedArticles.length}/${rawArticles.length} articles.`);
  return processedArticles;
}

