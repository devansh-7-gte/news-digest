// Day 3 guide: confirm @xenova/transformers loads an embedding model
// in-process (no Python, no external API) and produces 384-dim vectors that
// behave the way Week 2's retrieval math expects.
//
// Run: node scripts/embed-test.mjs
// First run downloads the model (~90MB) to a local cache under
// node_modules/.cache/ or your OS temp dir — subsequent runs are instant.

import { pipeline } from '@xenova/transformers';

function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function main() {
  console.log('Loading Xenova/all-MiniLM-L6-v2 (first run downloads the model)...');
  const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

  const samples = [
    'The Federal Reserve raised interest rates by 0.25% today.',
    'Central bank officials announced a quarter-point hike in borrowing costs.',
    'The local bakery introduced a new sourdough recipe this week.',
  ];

  console.log('\nEmbedding 3 sample strings...\n');
  const vectors = [];
  for (const text of samples) {
    const output = await embedder(text, {pooling: true, normalize: true});
    const vector = Array.from(output.data);
    vectors.push(vector);
    console.log(`"${text}"`);
    console.log(`  -> dims: ${vector.length}, first 5 values: [${vector.slice(0, 5).map((v) => v.toFixed(4)).join(', ')}, ...]`);
  }

  const [rateHike, rateHikeParaphrased, unrelated] = vectors;

  const simRelated = cosineSimilarity(rateHike, rateHikeParaphrased);
  const simUnrelated = cosineSimilarity(rateHike, unrelated);

  console.log(`
--- Cosine similarity checks ---
Fed-hike sentence vs its paraphrase (should be HIGH, same story different words): ${simRelated.toFixed(4)}
Fed-hike sentence vs bakery sentence   (should be LOW, unrelated topics):          ${simUnrelated.toFixed(4)}

--- What to confirm before Day 4 ---
1. dims === 384, matching the ArticleChunk.embedding vector(384) column exactly.
   If this model ever changes, the column width has to change with it.
2. The paraphrase similarity should be noticeably higher than the unrelated
   one (typically > 0.5 vs < 0.2) even though NOT ONE WORD overlaps between
   "interest rates" and "borrowing costs" — this is the whole point of dense
   embeddings over exact keyword matching, and exactly the gap Week 2's
   sparse (tsvector) retrieval will exist to cover for cases like ticker
   symbols or names that embeddings sometimes blur together.
`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
