import { prisma } from '@/lib/services/db';
import { pipeline } from '@xenova/transformers';

// Loaded once and reused across calls/batches — loading the model per-chunk
// would dominate runtime. Cached as a module-level promise so concurrent
// calls to runEmbedderAgent share the same load instead of racing.
let embedderPromise = null;
function getEmbedder() {
  if (!embedderPromise) {
    embedderPromise = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embedderPromise;
}

function toVectorLiteral(arr) {
  // pgvector's text input format: '[0.1,0.2,...]'
  return `[${arr.join(',')}]`;
}

// Prisma cannot SELECT or UPDATE an Unsupported("vector(384)") column through
// its normal client API — that type is excluded from the generated client
// entirely, not just from typed results. Both read and write go through raw
// SQL, same reason Day 2's <=> exploration needed $queryRawUnsafe.

/**
 * Run the embedding agent: batch-embeds ArticleChunk rows missing an
 * embedding via @xenova/transformers, in-process, no external API calls.
 * @param {number} limit - Max chunks to embed this run (default: 100)
 * @param {number} batchSize - Chunks embedded per pipeline call batch (default: 32)
 * @returns {Promise<{chunksEmbedded: number}>}
 */
export async function runEmbedderAgent(limit = 100, batchSize = 32) {
  console.log('[EmbedderAgent] Starting embedding cycle...');

  const chunks = await prisma.$queryRawUnsafe(
    `SELECT id, content FROM article_chunks WHERE embedding IS NULL LIMIT $1`,
    limit
  );

  if (chunks.length === 0) {
    console.log('[EmbedderAgent] No chunks missing embeddings.');
    return { chunksEmbedded: 0 };
  }

  console.log(`[EmbedderAgent] Found ${chunks.length} chunks missing embeddings (limit=${limit}).`);

  const embedder = await getEmbedder();
  let embedded = 0;

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i+batchSize);
    console.log(`[EmbedderAgent] Embedding batch ${i / batchSize + 1} (${batch.length} chunks)...`);

    for (const chunk of batch) {
      const output = await embedder(chunk.content, { pooling: 'mean', normalize: true });
      const vector = Array.from(output.data);

      await prisma.$executeRawUnsafe(
        `UPDATE article_chunks SET embedding = $1::vector WHERE id = $2::uuid`,
        toVectorLiteral(vector),
        chunk.id
      );
      embedded += 1;
    }
  }

  console.log(`[EmbedderAgent] Done. Embedded ${embedded} chunks.`);
  return { chunksEmbedded: embedded };
}
