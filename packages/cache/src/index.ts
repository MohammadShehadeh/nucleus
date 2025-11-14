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
  private connectingPromise: Promise<void> | null = null;

  private constructor(options: CacheOptions = {}) {
    const {
      url = env.REDIS_CONNECTION_STRING,
      defaultTTL = 3600 * 24 * 7, // 7 days default
    } = options;

    this.defaultTTL = defaultTTL;

    // Create Redis client
    this.client = createClient({
      url,
      socket: {
        reconnectStrategy: (retries: number) => Math.min(retries * 100, 3000),
      },
    });

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
   * Connect to Redis (call once at app startup)
   */
  async connect(): Promise<void> {
    // If already connected, do nothing
    if (this.isConnected && this.client.isOpen) {
      return;
    }

    // If currently connecting, wait for that promise
    if (this.connectingPromise) {
      return this.connectingPromise;
    }

    // Start new connection
    this.connectingPromise = this.client
      .connect()
      .then(() => {
        this.isConnected = true;
        this.connectingPromise = null;
      })
      .catch((err) => {
        this.connectingPromise = null;
        this.isConnected = false;
        console.error("Failed to connect to Redis:", err);
      });

    return this.connectingPromise;
  }

  /**
   * Ensure connection before operations (lazy connect)
   */
  private async ensureConnected(): Promise<void> {
    // If already connected, return immediately
    if (this.client.isReady && this.client.isOpen) {
      return;
    }

    // If currently connecting, wait for that promise
    if (this.connectingPromise) {
      return this.connectingPromise;
    }

    // Try to connect, but don't throw on failure
    await this.connect();
  }

  /**
   * Check if Redis is ready to accept commands
   */
  isReady(): boolean {
    return this.client.isReady;
  }

  /**
   * Check if the socket is open
   */
  isOpen(): boolean {
    return this.client.isOpen;
  }

  /**
   * Force disconnect immediately
   */
  async disconnect(): Promise<void> {
    if (this.isConnected || this.client.isOpen) {
      await this.client.destroy();
      this.isConnected = false;
    }
  }

  /**
   * Set a value in cache
   */
  async set<T>(key: string, value: T, options: CacheSetOptions = {}): Promise<void> {
    await this.ensureConnected();
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
    await this.ensureConnected();
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
    await this.ensureConnected();
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
    await this.ensureConnected();
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
    await this.ensureConnected();
    await this.client.flushDb();
  }

  async wrapWithCache<T>(fn: () => Promise<T>, options: WrapWithCacheOptions): Promise<T> {
    await this.ensureConnected();
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
    await this.ensureConnected();
    try {
      return this.client.multi();
    } catch (error) {
      console.error("Error creating pipeline:", error);
      return null;
    }
  }
}
