import { prisma } from '@/lib/services/db';
import { classifyArticle } from '@/lib/services/gemini';

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
    take: batchSize,
    orderBy: { fetchedAt: 'asc' }
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

      // Use body content for classification if available, fall back to title
      const contentToClassify = rawArticle.rawContent && rawArticle.rawContent.length > 50
        ? rawArticle.rawContent
        : rawArticle.title;

      // Call Gemini API to classify content
      const classification = await classifyArticle(rawArticle.title, contentToClassify);

      // Validate classified domain, default to 'technology' if invalid/missing
      const validDomains = ['finance', 'technology', 'health', 'politics', 'sports'];
      const domain = classification.domain && validDomains.includes(classification.domain.toLowerCase())
        ? classification.domain.toLowerCase()
        : 'technology';

      // Check if this URL is already registered in the processed articles table
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

      // Mark raw article as processed
      await prisma.rawArticle.update({
        where: { id: rawArticle.id },
        data: { isProcessed: true }
      });

      processedArticles.push(article);

      // Mild delay between API requests to avoid rate limits (1000ms)
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`[ClassifierAgent] Failed to classify raw article ${rawArticle.id}:`, error.message);
      
      // Update raw article incrementing failures or just log it to keep pipeline moving.
      // We do not mark it processed so it can retry later, but we skip to prevent lockups.
    }
  }

  console.log(`[ClassifierAgent] Classification cycle complete. Processed ${processedArticles.length}/${rawArticles.length} articles.`);
  return processedArticles;
}
