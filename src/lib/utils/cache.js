import { redis } from '@/lib/services/redis';

/**
 * Cache helper class
 */
export class CacheManager {
  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any>} Cached value or null
   */
  static async get(key) {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(JSON.stringify(data)) : null; // Parsing if string, but Redis gets JSON values cleanly. Let's make it safe.
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds
   */
  static async set(key, value, ttl = 3600) {
    try {
      await redis.setex(key, ttl, typeof value === 'string' ? value : JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Delete value from cache
   * @param {string} key - Cache key
   */
  static async delete(key) {
    try {
      await redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  /**
   * Get or set cache with loader function
   * @param {string} key - Cache key
   * @param {Function} loader - Async function to load data
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<any>} Cached or loaded value
   */
  static async getOrSet(key, loader, ttl = 3600) {
    try {
      // Try to get from cache
      const cached = await this.get(key);
      if (cached) {
        if (typeof cached === 'string') {
          try {
            return JSON.parse(cached);
          } catch {
            return cached;
          }
        }
        return cached;
      }

      // Load fresh data
      const data = await loader();

      // Cache it
      await this.set(key, data, ttl);

      return data;
    } catch (error) {
      console.error('Cache getOrSet error:', error);
      return await loader(); // Fallback to loader
    }
  }

  /**
   * Clear cache by prefix
   * @param {string} prefix - Key prefix
   */
  static async clearPrefix(prefix) {
    try {
      // This is a simplified version - Redis KEYS pattern matching
      const pattern = `${prefix}*`;
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await Promise.all(keys.map(key => redis.del(key)));
      }
    } catch (error) {
      console.error('Cache clearPrefix error:', error);
    }
  }
}

/**
 * Cache key generators
 */
export const cacheKeys = {
  article: (id) => `article:${id}`,
  articles: (domain, page) => `articles:${domain}:${page}`,
  user: (id) => `user:${id}`,
  userDigests: (userId) => `digests:${userId}`,
  subscriptions: (userId) => `subscriptions:${userId}`,
  stats: 'stats:global',
};
