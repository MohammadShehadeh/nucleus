import type {
  RedisClientType,
  RedisDefaultModules,
  RedisFunctions,
  RedisModules,
  RedisScripts,
} from "redis";
import { createClient } from "redis";

export type RedisClient = RedisClientType<
  RedisDefaultModules & RedisModules,
  RedisFunctions,
  RedisScripts
>;

export interface CacheOptions {
  url?: string;
  host?: string;
  port?: number;
  password?: string;
  database?: number;
  defaultTTL?: number; // Default TTL in seconds
}

export interface CacheSetOptions {
  ttl?: number; // TTL in seconds
}

export class RedisCache {
  private client: RedisClient;
  private defaultTTL: number;
  private isConnected = false;

  constructor(options: CacheOptions = {}) {
    const {
      url,
      host = "localhost",
      port = 6379,
      password,
      database = 0,
      defaultTTL = 3600, // 1 hour default
    } = options;

    this.defaultTTL = defaultTTL;

    // Create Redis client
    if (url) {
      this.client = createClient({ url });
    } else {
      this.client = createClient({
        socket: {
          host,
          port,
        },
        password,
        database,
      });
    }

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
  async set<T>(
    key: string,
    value: T,
    options: CacheSetOptions = {},
  ): Promise<void> {
    const { ttl = this.defaultTTL } = options;
    const serializedValue = JSON.stringify(value);
    if (ttl > 0) {
      await this.client.setEx(key, ttl, serializedValue);
    } else {
      await this.client.set(key, serializedValue);
    }
  }

  /**
   * Get a value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (value === null) {
      return null;
    }
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.error("Error parsing cached value:", error);
      return null;
    }
  }

  /**
   * Delete a key from cache
   */
  async del(key: string): Promise<number> {
    return await this.client.del(key);
  }

  /**
   * Check if a key exists
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  /**
   * Clear all keys (use with caution!)
   */
  async clear(): Promise<void> {
    await this.client.flushDb();
  }
}
