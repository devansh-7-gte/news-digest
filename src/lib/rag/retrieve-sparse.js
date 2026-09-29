import { prisma } from '@/lib/services/db';

// Sparse (keyword-based) retrieval via Postgres full-text search — no
// embedding model involved. This is dense retrieval's complement: it
// catches exact entity/name/ticker matches that cosine similarity on
// sentence embeddings sometimes blurs together (RAG doc §3.4).

/**
 * @param {string} queryText
 * @param {number} topK - default 25, matching retrieveDense's default so
 *   Day 11's RRF fusion gets two comparably-sized ranked lists to merge.
 * @returns {Promise<Array<{chunkId: string, articleId: string, title: string, content: string, sourceTier: string, score: number}>>}
 */
export async function retrieveSparse(queryText, topK = 25) {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT
       ac.id AS "chunkId",
       ac.article_id AS "articleId",
       a.title,
       ac.content,
       ac.source_tier AS "sourceTier",
       ts_rank(to_tsvector('english', ac.content), plainto_tsquery('english', $1)) AS score
     FROM article_chunks ac
     JOIN articles a ON a.id = ac.article_id
     WHERE to_tsvector('english', ac.content) @@ plainto_tsquery('english', $1)
     ORDER BY score DESC
     LIMIT $2`,
    queryText,
    topK
  );

  return rows.map((r) => ({ ...r, score: Number(r.score) }));
}
