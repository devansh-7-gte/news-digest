// Day 10 exit check: pick a query with a proper noun/entity that dense
// (embedding) search is likely to underrate, and see whether sparse
// (keyword) search finds it more directly. This comparison is the entire
// justification for doing hybrid retrieval at all.
//
// Run: npx tsx --tsconfig jsconfig.json scripts/day10-compare-dense-sparse.js "<query>"

import { retrieveDense } from '@/lib/rag/retrieve-dense';
import { retrieveSparse } from '@/lib/rag/retrieve-sparse';

async function main() {
  const query = process.argv.slice(2).join(' ') || 'DeRozan';
  console.log(`Query: "${query}"\n`);

  const [dense, sparse] = await Promise.all([
    retrieveDense(query, 10),
    retrieveSparse(query, 10),
  ]);

  console.log('--- Dense (embedding cosine distance, LOWER = better) ---');
  if (dense.length === 0) console.log('(no results)');
  dense.forEach((r, i) => {
    console.log(`${i + 1}. distance=${r.distance.toFixed(4)}  [${r.sourceTier}] ${r.title}`);
  });

  console.log('\n--- Sparse (tsvector/ts_rank keyword match, HIGHER = better) ---');
  if (sparse.length === 0) console.log('(no results — query has no keyword overlap with any chunk)');
  sparse.forEach((r, i) => {
    console.log(`${i + 1}. score=${r.score.toFixed(4)}    [${r.sourceTier}] ${r.title}`);
  });

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
