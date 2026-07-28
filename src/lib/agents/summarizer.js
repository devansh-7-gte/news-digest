import { prisma } from '@/lib/services/db';
import { summarizeArticle } from '@/lib/services/gemini';

function fallbackSummarizeText(title, content) {
  const text = (content && content.length > 50) ? content.trim() : title;
  const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.length > 10);
  
  const brief = sentences[0] || title;
  const medium = sentences.slice(0, 3).join(' ') || title;
  const detailed = sentences.slice(0, 5).join(' ') || title;
  const keyPoints = sentences.slice(0, 3).map(s => s.replace(/^[•\-\*\s]+/, '').trim());

  return {
    brief: brief.substring(0, 200),
    medium: medium.substring(0, 400),
    detailed: detailed.substring(0, 800),
    keyPoints: keyPoints.length > 0 ? keyPoints : [title]
  };
}

/**
 * Run the summarizer agent to generate multi-tier summaries for classified articles.
 * Processes articles in batches.
 * @param {number} batchSize - Number of articles to summarize in this run (default: 15)
 * @returns {Promise<Array>} Array of successfully summarized ArticleSummary records
 */
export async function runSummarizerAgent(batchSize = 15) {
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
    orderBy: { createdAt: 'desc' }
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

      const contentToSummarize = article.rawArticle?.rawContent && article.rawArticle.rawContent.length > 50
        ? article.rawArticle.rawContent.slice(0, 500)
        : article.title;

      let summaryResult;
      let modelUsed = 'gemini-2.0-flash';
      try {
        summaryResult = await summarizeArticle(article.title, contentToSummarize);
      } catch (geminiError) {
        console.warn(`[SummarizerAgent] Gemini API unavailable (${geminiError.message}). Using offline extractive summary fallback for "${article.title}"`);
        summaryResult = fallbackSummarizeText(article.title, contentToSummarize);
        modelUsed = 'extractive-fallback';
      }

      const existingSummary = await prisma.articleSummary.findUnique({
        where: { articleId: article.id }
      });

      const summaryData = {
        summaryBrief: summaryResult.brief || article.title,
        summaryMedium: summaryResult.medium || summaryResult.brief || article.title,
        summaryDetailed: summaryResult.detailed || summaryResult.medium || article.title,
        keyPoints: summaryResult.keyPoints || [article.title],
        modelUsed: modelUsed
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
    } catch (error) {
      console.error(`[SummarizerAgent] Failed to summarize article ${article.id}:`, error.message);
    }
  }

  console.log(`[SummarizerAgent] Summarization cycle complete. Generated ${generatedSummaries.length}/${articles.length} summaries.`);
  return generatedSummaries;
}

