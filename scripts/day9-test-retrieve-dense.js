// Day 9 exit check: call retrieveDense() as a real function, not inline
// script logic, and confirm it returns a properly ranked, properly shaped
// result set.
//
// Run: npx tsx --tsconfig jsconfig.json scripts/day9-test-retrieve-dense.mjs "<query>"

import { retrieveDense } from '@/lib/rag/retrieve-dense';

async function main() {
  const query = process.argv.slice(2).join(' ') || 'NBA free agency and trades';
  console.log(`Query: "${query}"\n`);

  const results = await retrieveDense(query, 25);

  console.log(`Returned ${results.length} results (topK=25 requested).\n`);
  results.slice(0, 8).forEach((r, i) => {
    console.log(`${i + 1}. distance=${r.distance.toFixed(4)}  [${r.sourceTier}] ${r.title}`);
  });

  console.log(`\n--- Shape check on result[0] ---`);
  console.log(results[0]);

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
