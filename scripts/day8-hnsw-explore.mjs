// Day 8 guide: confirm the HNSW index exists, then learn to read
// EXPLAIN ANALYZE output for a real cosine-distance query.
//
// Run: node scripts/day8-hnsw-explore.mjs

import { PrismaClient } from '@prisma/client';
import { pipeline } from '@xenova/transformers';

const prisma = new PrismaClient();

function toVectorLiteral(arr) {
  return `[${arr.join(',')}]`;
}

async function main() {
  console.log('--- Step 1: confirm the HNSW index exists ---');
  const indexes = await prisma.$queryRawUnsafe(
    `SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'article_chunks'`
  );
  console.log(indexes);

  const size = await prisma.$queryRawUnsafe(
    `SELECT pg_size_pretty(pg_relation_size('article_chunk_embedding_idx')) AS size`
  );
  console.log('Index size:', size[0].size);

  const rowCounts = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*)::int AS total, COUNT(embedding)::int AS embedded
     FROM article_chunks`
  );
  console.log('Rows:', rowCounts[0]);

  console.log('\n--- Step 2: EXPLAIN ANALYZE a real cosine query ---');
  const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  const output = await embedder('NBA trade deadline news', { pooling: 'mean', normalize: true });
  const vector = toVectorLiteral(Array.from(output.data));

  const plan = await prisma.$queryRawUnsafe(
    `EXPLAIN ANALYZE
     SELECT id FROM article_chunks
     WHERE embedding IS NOT NULL
     ORDER BY embedding <=> $1::vector
     LIMIT 5`,
    vector
  );
  console.log(plan.map((r) => r['QUERY PLAN']).join('\n'));

  console.log(`
--- How to read this ---
Look for "Index Scan using article_chunk_embedding_idx" vs "Seq Scan on article_chunks".
At ~100-135 rows, the planner will very likely choose Seq Scan — and that is
CORRECT, not a bug. Below a certain row count (rule of thumb: low thousands),
scanning every row is cheaper than traversing the HNSW graph structure. The
index only starts winning once a sequential scan becomes the expensive option
— the RAG doc frames this as "past ~100k vectors" territory. Seeing Seq Scan
here just means your corpus hasn't reached that crossover point yet.

--- Step 3: ef_search (only affects the plan once the index IS chosen) ---
`);

  await prisma.$executeRawUnsafe(`SET hnsw.ef_search = 40`);
  const planWithEfSearch = await prisma.$queryRawUnsafe(
    `EXPLAIN ANALYZE
     SELECT id FROM article_chunks
     WHERE embedding IS NOT NULL
     ORDER BY embedding <=> $1::vector
     LIMIT 5`,
    vector
  );
  console.log(planWithEfSearch.map((r) => r['QUERY PLAN']).join('\n'));

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
