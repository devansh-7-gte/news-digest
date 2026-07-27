import { createHash } from 'crypto';

/**
 * Generate MD5 hash for content deduplication
 * @param {string} content - Content to hash
 * @returns {string} MD5 hash
 */
export function generateContentHash(content) {
  return createHash('md5').update(content).digest('hex');
}
