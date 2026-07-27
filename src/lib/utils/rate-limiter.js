import { redis } from '@/lib/services/redis';

/**
 * Rate limit helper class
 */
export class RateLimiter {
  constructor(limit, windowSeconds) {
    this.limit = limit;
    this.windowSeconds = windowSeconds;
  }

  async checkLimit(identifier) {
    return await redis.incr(`ratelimit:${identifier}`);
  }

  async resetLimit(identifier) {
    await redis.del(`ratelimit:${identifier}`);
  }

  async isLimited(identifier) {
    const key = `ratelimit:${identifier}`;
    const current = await redis.get(key);

    if (!current) {
      // Corrected: upstash redis set accepts options as third param, but let's use standard setex-like arguments or simple set with ex option.
      // In @upstash/redis, it can be: redis.set(key, 0, { ex: this.windowSeconds })
      await redis.set(key, 0, { ex: this.windowSeconds });
      return false;
    }

    if (parseInt(current) >= this.limit) {
      return true;
    }

    await redis.incr(key);
    return false;
  }

  async getRemainingAttempts(identifier) {
    const key = `ratelimit:${identifier}`;
    const current = await redis.get(key);
    return Math.max(0, this.limit - (parseInt(current) || 0));
  }
}

/**
 * Create rate limiters for different endpoints
 */
export const emailRateLimiter = new RateLimiter(5, 3600); // 5 per hour
export const apiRateLimiter = new RateLimiter(100, 3600); // 100 per hour
export const authRateLimiter = new RateLimiter(10, 900); // 10 per 15 minutes
