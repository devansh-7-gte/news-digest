import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Check rate limit for an identifier
 * @param {string} identifier - Unique identifier (user ID, IP, etc)
 * @param {number} limit - Maximum requests allowed
 * @param {number} window - Time window in seconds
 * @returns {Promise<Object>} Rate limit result
 */
export async function checkRateLimit(identifier, limit, window) {
  const key = `rate_limit:${identifier}`;
  
  const count = await redis.incr(key);
  
  if (count === 1) {
    await redis.expire(key, window);
  }
  
  if (count > limit) {
    return { success: false, remaining: 0 };
  }
  
  return { success: true, remaining: limit - count };
}

/**
 * Cache article data
 * @param {string} url - Article URL
 * @param {Object} data - Article data to cache
 * @param {number} ttl - Time to live in seconds
 */
export async function cacheArticle(url, data, ttl = 3600) {
  const key = `article:${url}`;
  await redis.setex(key, ttl, JSON.stringify(data));
}

/**
 * Get cached article
 * @param {string} url - Article URL
 * @returns {Promise<Object|null>} Cached article data or null
 */
export async function getCachedArticle(url) {
  const key = `article:${url}`;
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
}
