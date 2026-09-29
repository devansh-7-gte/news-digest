// Day 11 exit check: fuse real dense + sparse results and confirm chunks
// both methods agree on float to the top of the merged list.
//
// Run: npx tsx --tsconfig jsconfig.json scripts/day11-test-fuse.js "<query>"

import { retrieveDense } from '@/lib/rag/retrieve-dense';
import { retrieveSparse } from '@/lib/rag/retrieve-sparse';
import { fuseResults } from '@/lib/rag/fuse';

async function main() {
  const query = process.argv.slice(2).join(' ') || 'NBA free agency and trades';
  console.log(`Query: "${query}"\n`);

  const [dense, sparse] = await Promise.all([
    retrieveDense(query, 10),
    retrieveSparse(query, 10),
  ]);

  console.log(`Dense returned ${dense.length}, sparse returned ${sparse.length}.\n`);

  const fused = fuseResults(dense, sparse);

  console.log('--- Fused (RRF) ranking ---');
  fused.slice(0, 10).forEach((r, i) => {
    const tags = [r.inDense ? 'dense' : null, r.inSparse ? 'sparse' : null].filter(Boolean).join('+');
    console.log(`${i + 1}. rrfScore=${r.rrfScore.toFixed(5)}  [${tags}]  [${r.sourceTier}] ${r.title}`);
  });

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
