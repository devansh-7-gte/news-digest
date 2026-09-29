// Day 2 guide: hand-insert vectors, run the pgvector cosine-distance operator
// directly, and build intuition for what `<=>` returns before any embedding
// model or retrieval code exists.
//
// Run: node scripts/day2-pgvector-explore.mjs

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const DIM = 384;

// A controlled toy vector: 384 numbers following a fixed sine pattern so it's
// reproducible and easy to reason about (real embeddings will look like this
// shape-wise — dense floats, no zeros — just semantically meaningless here).
function baseVector(seedOffset = 0) {
  return Array.from({ length: DIM }, (_, i) => Math.sin(i + seedOffset));
}

function toVectorLiteral(arr) {
  // pgvector's text input format: '[0.1,0.2,...]'
  return `[${arr.join(',')}]`;
}

async function main() {
  const [a1, a2, a3] = await prisma.article.findMany({
    take: 3,
    select: { id: true, title: true },
  });

  const vecSame = baseVector(0); // baseline direction
  const vecScaled = baseVector(0).map((x)=>x*5); // same direction, different magnitude
  const vecShifted = baseVector(0.05); // nearly same direction, tiny angle change
  const vecOpposite = baseVector(0).map((x) => -x); // exactly opposite direction

  console.log('--- Step 1: insert 3 hand-crafted rows ---');

  await prisma.$executeRawUnsafe(
    `INSERT INTO article_chunks (id, article_id, content, chunk_index, token_count, embedding, source_tier)
     VALUES (gen_random_uuid(), $1::uuid, $2, 0, 1, $3::vector, 'test')`,
    a1.id,
    `[TEST] scaled copy of query vector — same direction, article: ${a1.title}`,
    toVectorLiteral(vecScaled)
  );

  await prisma.$executeRawUnsafe(
    `INSERT INTO article_chunks (id, article_id, content, chunk_index, token_count, embedding, source_tier)
     VALUES (gen_random_uuid(), $1::uuid, $2, 0, 1, $3::vector, 'test')`,
    a2.id,
    `[TEST] nearly same direction as query vector, article: ${a2.title}`,
    toVectorLiteral(vecShifted)
  );

  await prisma.$executeRawUnsafe(
    `INSERT INTO article_chunks (id, article_id, content, chunk_index, token_count, embedding, source_tier)
     VALUES (gen_random_uuid(), $1::uuid, $2, 0, 1, $3::vector, 'test')`,
    a3.id,
    `[TEST] opposite direction from query vector, article: ${a3.title}`,
    toVectorLiteral(vecOpposite)
  );

  console.log('Inserted 3 test rows tagged source_tier = \'test\'.\n');

  console.log('--- Step 2: cosine-distance query against a query vector ---');
  console.log('Query vector = vecSame (the un-scaled, un-shifted baseline)\n');

  const results = await prisma.$queryRawUnsafe(
    `SELECT content, embedding <=> $1::vector AS distance
     FROM article_chunks
     WHERE source_tier = 'test'
     ORDER BY distance
     LIMIT 5`,
    toVectorLiteral(vecSame)
  );

  for (const row of results) {
    console.log(`distance=${Number(row.distance).toFixed(6)}  ${row.content}`);
  }

  console.log(`
--- What to notice ---
1. The "scaled copy" row has distance ~0.0 even though its magnitude is 5x
   the query vector. Cosine distance ignores magnitude entirely — it only
   measures the ANGLE between vectors. That's why it's the right metric for
   sentence embeddings: models don't guarantee unit-length output, and you
   don't want longer/shorter text vectors to seem "more different" just
   because of scale.
2. The "nearly same direction" row has a small positive distance, not zero —
   proof <=> is measuring an actual angle, not just checking equality.
3. The "opposite direction" row has distance ~2.0. pgvector's <=> returns
   (1 - cosine_similarity). Cosine similarity ranges [-1, 1], so distance
   ranges [0, 2]: 0 = identical direction, 1 = orthogonal (unrelated), 2 =
   exactly opposite. This is why "lower = more similar" in every ORDER BY
   you'll write from here on.
`);

  console.log('--- Step 3: cleanup (delete the test rows) ---');
  const deleted = await prisma.articleChunk.deleteMany({ where: { sourceTier: 'test' } });
  console.log(`Deleted ${deleted.count} test rows. article_chunks is empty again, ready for Day 4's real chunker.`);

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
