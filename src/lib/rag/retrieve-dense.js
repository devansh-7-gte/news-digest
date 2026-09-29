import { prisma } from '@/lib/services/db';
import { pipeline } from '@xenova/transformers';

// Loaded once and reused across calls — same lazy-singleton pattern as
// src/lib/agents/embedder.js, for the same reason: loading the model per
// call would dominate query latency.
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

// Prisma cannot SELECT/ORDER BY an Unsupported("vector(384)") column through
// its normal client API, so this stays raw SQL — same reason Day 2/5/8 did.

/**
 * Dense (embedding-based) retrieval: embeds queryText and returns the topK
 * closest article_chunks by cosine distance, joined back to their article
 * for citation info. Returns [] if no chunks are embedded yet.
 * @param {string} queryText
 * @param {number} topK - default 25 (deliberately wide: Day 11's RRF fusion
 *   and Day 12's reranker both need a real candidate pool, not top-5)
 * @returns {Promise<Array<{chunkId: string, articleId: string, title: string, content: string, sourceTier: string, distance: number}>>}
 */
export async function retrieveDense(queryText, topK = 25) {
  const embedder = await getEmbedder();
  const output = await embedder(queryText, { pooling: 'mean', normalize: true });
  const vector = toVectorLiteral(Array.from(output.data));

  const rows = await prisma.$queryRawUnsafe(
    `SELECT
       ac.id AS "chunkId",
       ac.article_id AS "articleId",
       a.title,
       ac.content,
       ac.source_tier AS "sourceTier",
       ac.embedding <=> $1::vector AS distance
     FROM article_chunks ac
     JOIN articles a ON a.id = ac.article_id
     WHERE ac.embedding IS NOT NULL
     ORDER BY distance
     LIMIT $2`,
    vector,
    topK
  );

  return rows.map((r) => ({ ...r, distance: Number(r.distance) }));
}
