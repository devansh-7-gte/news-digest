// Day 5 / Week 1 exit check: embed a hand-typed query and run it against
// REAL embedded article_chunks, not toy vectors. This is the moment Week 1
// is either trustworthy or isn't.
//
// Run: node scripts/day5-verify-embeddings.mjs "<query text>"

import { PrismaClient } from '@prisma/client';
import { pipeline } from '@xenova/transformers';

const prisma = new PrismaClient();

function toVectorLiteral(arr) {
  return `[${arr.join(',')}]`;
}

async function main() {
  const query = process.argv.slice(2).join(' ') || 'stock market interest rates';
  console.log(`Query: "${query}"\n`);

  const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  const output = await embedder(query, { pooling: 'mean', normalize: true });
  const vector = Array.from(output.data);

  const results = await prisma.$queryRawUnsafe(
    `SELECT ac.content, ac.source_tier, a.title, ac.embedding <=> $1::vector AS distance
     FROM article_chunks ac
     JOIN articles a ON a.id = ac.article_id
     WHERE ac.embedding IS NOT NULL
     ORDER BY distance
     LIMIT 5`,
    toVectorLiteral(vector)
  );

  for (const row of results) {
    console.log(`distance=${Number(row.distance).toFixed(4)}  [${row.source_tier}] ${row.title}`);
    console.log(`  "${row.content.slice(0, 120)}${row.content.length > 120 ? '...' : ''}"\n`);
  }

  const nullCount = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*)::int AS count FROM article_chunks WHERE embedding IS NULL`
  );
  const totalCount = await prisma.articleChunk.count();
  console.log(`Remaining unembedded: ${nullCount[0].count} / ${totalCount} total chunks.`);

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
