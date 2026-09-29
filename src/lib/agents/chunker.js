import { prisma } from '@/lib/services/db';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { getEncoding } from 'js-tiktoken';

// cl100k_base (GPT-3.5/4 tokenizer) — Gemini doesn't ship a public local
// tokenizer, so this is a deliberate approximation. Good enough for
// context-window budgeting, and free/local vs. calling Gemini's
// countTokens endpoint per chunk.
const encoder = getEncoding('cl100k_base');
const countTokens = (text) => encoder.encode(text).length;

// Midpoint of the 300-500 token target, ~15% overlap.
const CHUNK_SIZE_TOKENS = 400;
const CHUNK_OVERLAP_TOKENS = Math.round(CHUNK_SIZE_TOKENS * 0.15); // 60

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: CHUNK_SIZE_TOKENS,
  chunkOverlap: CHUNK_OVERLAP_TOKENS,
  lengthFunction: countTokens, // size chunks by tokens, not raw characters
});

/**
 * Builds (but does not insert) the chunk rows for one article.
 * brief / medium -> single chunk, as-is.
 * detailed       -> split via RecursiveCharacterTextSplitter.
 */
async function buildChunksForArticle(article) {
  const { id: articleId, summaries } = article;
  const rows = [];

  for (const [tier, text] of [
    ['brief', summaries.summaryBrief],
    ['medium', summaries.summaryMedium],
  ]) {
    if (!text?.trim()) continue; // tier wasn't generated for this article
    rows.push({
      articleId,
      content: text,
      chunkIndex: 0,
      tokenCount: countTokens(text),
      sourceTier: tier,
    });
  }

  const detailed = summaries.summaryDetailed;
  if (detailed?.trim()) {
    const pieces = await splitter.splitText(detailed);
    pieces.forEach((piece, i) => {
      rows.push({
        articleId,
        content: piece,
        chunkIndex: i,
        tokenCount: countTokens(piece),
        sourceTier: 'detailed',
      });
    });
  }

  return rows;
}

/**
 * Run the chunking agent: splits each summarized article's tiers into
 * ArticleChunk rows ready for embedding (Day 5). Makes zero LLM calls —
 * tokenizing and splitting happens entirely locally.
 * @param {number} batchSize - Number of unchunked articles to process (default: 15)
 * @returns {Promise<{articlesProcessed: number, chunksCreated: number}>}
 */
export async function runChunkerAgent(batchSize = 15) {
  console.log('[ChunkerAgent] Starting chunking cycle...');

  const articles = await prisma.article.findMany({
    where: {
      summaries: { isNot: null },
      chunks: { none: {} }, // skip articles already chunked - keeps this idempotent
    },
    include: { summaries: true },
    take: batchSize,
    orderBy: { createdAt: 'desc' },
  });

  if (articles.length === 0) {
    console.log('[ChunkerAgent] No unchunked articles found.');
    return { articlesProcessed: 0, chunksCreated: 0 };
  }

  console.log(`[ChunkerAgent] Found ${articles.length} unchunked articles (batchSize=${batchSize}).`);

  let totalChunks = 0;

  for (const article of articles) {
    const rows = await buildChunksForArticle(article);

    if (rows.length === 0) {
      console.warn(`[ChunkerAgent]  ⚠ ${article.id} produced 0 chunks - check summary content`);
      continue;
    }

    await prisma.articleChunk.createMany({ data: rows });
    totalChunks += rows.length;

    const tierCounts = rows.reduce((acc, row)=>{
        acc[row.sourceTier]=(acc[row.sourceTier]||0)+1;
        return acc;
    }, {});
    console.log(`[ChunkerAgent]  ✓ ${article.id} -> ${rows.length} chunks (${JSON.stringify(tierCounts)})`);
  }

  console.log(`[ChunkerAgent] Done. Inserted ${totalChunks} chunks across ${articles.length} articles.`);
  console.log('[ChunkerAgent] embedding column left null on all of them - that is Day 5\'s job.');

  return { articlesProcessed: articles.length, chunksCreated: totalChunks };
}
