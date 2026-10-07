import type { Redis } from "@nucleus/cache";

export interface RateLimitOptions {
  limit: number;
  window: number; // milliseconds
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

export class RedisRateLimiter {
  private redis: Redis;
  private limit: number;
  private window: number;

  constructor(redis: Redis, options: RateLimitOptions) {
    this.redis = redis;
    this.limit = options.limit;
    this.window = options.window;
  }

  private normalizeCount(count: unknown): number {
    return typeof count === "number" ? count : 0;
  }

  async check(key: string): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - this.window;
    const redisKey = `rate_limit:${key}`;

    try {
      // Anonymous/cold traffic never goes through the cache path, so nothing
      // else opens the connection — establish it here (fail-open if Redis is down).
      await this.redis.connect().catch(() => undefined);

      const pipeline = await this.redis.multi();
      if (!pipeline) {
        console.warn("Failed to create pipeline");

        return {
          allowed: true,
          remaining: this.limit - 1,
          resetTime: now + this.window,
        };
      }

      pipeline.zRemRangeByScore(redisKey, 0, windowStart);

      pipeline.zAdd(redisKey, { score: now, value: now.toString() });

      pipeline.zCard(redisKey);

      pipeline.pExpire(redisKey, this.window);

      const results = await pipeline.exec();

      if (!results) {
        console.warn("Failed to execute pipeline");

        return {
          allowed: true,
          remaining: this.limit - 1,
          resetTime: now + this.window,
        };
      }

      const [_, __, currentCount] = results;
      const normalizedCount = this.normalizeCount(currentCount);
      const allowed = normalizedCount <= this.limit;
      const remaining = Math.max(0, this.limit - normalizedCount);

      return { allowed, remaining, resetTime: now + this.window };
    } catch (error) {
      console.error("Failed to check rate limit:", error);

      return {
        allowed: true,
        remaining: this.limit - 1,
        resetTime: now + this.window,
      };
    }
  }

  /** Reads the current window without recording a request. */
  async status(key: string): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - this.window;
    const redisKey = `rate_limit:${key}`;

    try {
      await this.redis.connect().catch(() => undefined);

      const pipeline = await this.redis.multi();
      if (!pipeline) {
        console.warn("Failed to create pipeline");

        return {
          allowed: true,
          remaining: this.limit,
          resetTime: now + this.window,
        };
      }

      pipeline.zRemRangeByScore(redisKey, 0, windowStart);

      pipeline.zCard(redisKey);

      const results = await pipeline.exec();

      if (!results) {
        console.warn("Failed to execute pipeline");

        return {
          allowed: true,
          remaining: this.limit,
          resetTime: now + this.window,
        };
      }

      const [, currentCount] = results;
      const normalizedCount = this.normalizeCount(currentCount);
      const allowed = normalizedCount <= this.limit;
      const remaining = Math.max(0, this.limit - normalizedCount);

      return {
        allowed,
        remaining,
        resetTime: now + this.window,
      };
    } catch (error) {
      console.error("Failed to get status:", error);

      return {
        allowed: true,
        remaining: this.limit,
        resetTime: now + this.window,
      };
    }
  }

  async reset(key: string): Promise<void> {
    const redisKey = `rate_limit:${key}`;
    try {
      await this.redis.del(redisKey);
    } catch (error) {
      console.error("Failed to reset rate limit:", error);
    }
  }
}
