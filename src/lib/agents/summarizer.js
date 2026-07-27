import { prisma } from '@/lib/services/db';
import { summarizeArticle } from '@/lib/services/gemini';

/**
 * Run the summarizer agent to generate multi-tier summaries for classified articles.
 * Processes articles in batches.
 * @param {number} batchSize - Number of articles to summarize in this run (default: 10)
 * @returns {Promise<Array>} Array of successfully summarized ArticleSummary records
 */
export async function runSummarizerAgent(batchSize = 10) {
  console.log('[SummarizerAgent] Starting summarization cycle...');

  // Get articles that do not have any summaries yet
  const articles = await prisma.article.findMany({
    where: {
      summaries: null
    },
    include: {
      rawArticle: true
    },
    take: batchSize,
    orderBy: { createdAt: 'asc' }
  });

  if (articles.length === 0) {
    console.log('[SummarizerAgent] No unsummarized articles found.');
    return [];
  }

  console.log(`[SummarizerAgent] Found ${articles.length} articles to summarize.`);
  const generatedSummaries = [];

  for (const article of articles) {
    try {
      console.log(`[SummarizerAgent] Summarizing: "${article.title}" (ID: ${article.id})`);

      // Retrieve content from original raw article, fallback to title
      const contentToSummarize = article.rawArticle?.rawContent && article.rawArticle.rawContent.length > 50
        ? article.rawArticle.rawContent
        : article.title;

      // Call Gemini API to generate multi-tier summaries
      const summaryResult = await summarizeArticle(article.title, contentToSummarize);

      // Check if a summary already exists for this article (safety check)
      const existingSummary = await prisma.articleSummary.findUnique({
        where: { articleId: article.id }
      });

      const summaryData = {
        summaryBrief: summaryResult.brief || article.title,
        summaryMedium: summaryResult.medium || '',
        summaryDetailed: summaryResult.detailed || '',
        keyPoints: summaryResult.keyPoints || [],
        modelUsed: 'gemini-2.0-flash'
      };

      let articleSummary;

      if (existingSummary) {
        articleSummary = await prisma.articleSummary.update({
          where: { articleId: article.id },
          data: summaryData
        });
        console.log(`[SummarizerAgent] Updated existing summary for article: ${article.id}`);
      } else {
        articleSummary = await prisma.articleSummary.create({
          data: {
            ...summaryData,
            articleId: article.id
          }
        });
        console.log(`[SummarizerAgent] Created new summary for article: ${article.id}`);
      }

      generatedSummaries.push(articleSummary);

      // Mild delay between API requests to avoid rate limits (1000ms)
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`[SummarizerAgent] Failed to summarize article ${article.id}:`, error.message);
    }
  }

  console.log(`[SummarizerAgent] Summarization cycle complete. Generated ${generatedSummaries.length}/${articles.length} summaries.`);
  return generatedSummaries;
}
