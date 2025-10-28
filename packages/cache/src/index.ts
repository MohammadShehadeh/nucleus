import type {
  RedisClientType,
  RedisDefaultModules,
  RedisFunctions,
  RedisModules,
  RedisScripts,
} from "redis";
import { createClient } from "redis";
import { cacheEnv } from "../env";

const env = cacheEnv();
export type RedisClient = RedisClientType<
  RedisDefaultModules & RedisModules,
  RedisFunctions,
  RedisScripts
>;

export interface CacheOptions {
  url?: string;
  defaultTTL?: number; // Default TTL in seconds
}

export interface CacheSetOptions {
  ttl?: number; // TTL in seconds
}

export interface WrapWithCacheOptions {
  key: string; // Key to use for the cache
  ttl?: number; // TTL in seconds
}

export class Redis {
  private client: RedisClient;
  private defaultTTL: number;
  private isConnected = false;
  private static instance: Redis | null = null;

  private constructor(options: CacheOptions = {}) {
    const {
      url = env.REDIS_CONNECTION_STRING,
      defaultTTL = 3600 * 24 * 7, // 7 days default
    } = options;

    this.defaultTTL = defaultTTL;

    // Create Redis client
    this.client = createClient({ url });

    // Set up error handling
    this.client.on("error", (err) => {
      console.error("Redis Client Error:", err);
      this.isConnected = false;
    });

    this.client.on("connect", () => {
      console.log("Redis Client Connected");
      this.isConnected = true;
    });

    this.client.on("disconnect", () => {
      console.log("Redis Client Disconnected");
      this.isConnected = false;
    });
  }

  /**
   * Get or create the singleton instance of Redis
   */
  public static getInstance(options?: CacheOptions): Redis {
    if (!Redis.instance) {
      Redis.instance = new Redis(options);
    }
    return Redis.instance;
  }

  /**
   * Initialize the cache with options (call this once at app startup)
   */
  public static initialize(options?: CacheOptions): Redis {
    return Redis.getInstance(options);
  }

  /**
   * Connect to Redis
   */
  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect();
    }
  }

  /**
   * Disconnect from Redis
   */
  destroy(): void {
    if (this.isConnected) {
      this.client.destroy();
    }
  }

  /**
   * Set a value in cache
   */
  async set<T>(key: string, value: T, options: CacheSetOptions = {}): Promise<void> {
    const { ttl = this.defaultTTL } = options;
    try {
      const serializedValue = JSON.stringify(value);

      await this.client.setEx(key, ttl, serializedValue);
    } catch (error) {
      console.error("Error setting value in cache:", error);
    }
  }

  /**
   * Get a value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (value === null) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error("Error getting value from cache:", error);
      return null;
    }
  }

  /**
   * Delete a key from cache
   */
  async del(key: string): Promise<number> {
    try {
      return await this.client.del(key);
    } catch (error) {
      console.error("Error deleting key:", error);
      return 0;
    }
  }

  /**
   * Check if a key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error("Error checking if key exists:", error);
      return false;
    }
  }

  /**
   * Clear all keys (use with caution!)
   */
  async clear(): Promise<void> {
    await this.connect();
    await this.client.flushDb();
  }

  async wrapWithCache<T>(fn: () => Promise<T>, options: WrapWithCacheOptions): Promise<T> {
    await this.connect();
    const { key, ttl = this.defaultTTL } = options;
    const value = await this.get<T>(key);
    if (value) return value;
    const result = await fn();
    await this.set(key, result, { ttl });
    return result;
  }

  /**
   * Create a new pipeline
   */
  async multi(): Promise<ReturnType<RedisClient["multi"]> | null> {
    try {
      return this.client.multi();
    } catch (error) {
      console.error("Error creating pipeline:", error);
      return null;
    }
  }
}
