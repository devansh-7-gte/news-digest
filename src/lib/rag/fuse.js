// Reciprocal Rank Fusion: merges dense (cosine distance, lower=better) and
// sparse (ts_rank score, higher=better) result lists into one ranked list,
// without ever comparing their raw scores directly — RRF only looks at
// RANK POSITION within each list, which sidesteps the fact that the two
// scores aren't on the same scale at all (RAG doc §3.4).
//
// score(chunk) = sum over each list it appears in of 1 / (k + rank)
// where rank is 1-indexed position in that list. A chunk both retrieval
// methods rank highly outscores one only one method likes.

const DEFAULT_K = 60; // standard RRF constant; softens rank-1 dominance

/**
 * @param {Array<{chunkId: string}>} denseResults - already ranked best-first
 * @param {Array<{chunkId: string}>} sparseResults - already ranked best-first
 * @param {number} k - RRF constant (default 60)
 * @returns {Array<{chunkId: string, rrfScore: number, inDense: boolean, inSparse: boolean, ...chunkFields}>}
 *   merged, ranked best-first by rrfScore descending. Chunk fields (title,
 *   content, sourceTier, articleId) are taken from whichever list has them
 *   first, since both retrieve-dense/retrieve-sparse return the same shape.
 */
export function fuseResults(denseResults, sparseResults, k = DEFAULT_K) {
  const scores = new Map(); // chunkId -> { rrfScore, inDense, inSparse, ...chunkData }

  denseResults.forEach((chunk, i) => {
    const rank = i + 1;
    const existing = scores.get(chunk.chunkId) || { ...chunk, rrfScore: 0, inDense: false, inSparse: false };
    existing.rrfScore += 1 / (k + rank);
    existing.inDense = true;
    scores.set(chunk.chunkId, existing);
  });

  sparseResults.forEach((chunk, i) => {
    const rank = i + 1;
    const existing = scores.get(chunk.chunkId) || { ...chunk, rrfScore: 0, inDense: false, inSparse: false };
    existing.rrfScore += 1 / (k + rank);
    existing.inSparse = true;
    scores.set(chunk.chunkId, existing);
  });

  return Array.from(scores.values()).sort((a, b) => b.rrfScore - a.rrfScore);
}
