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
  /**
   * Default TTL in seconds
   * @default 3600 * 24 * 1 (1 day)
   */
  defaultTTL?: number;
}

export interface CacheSetOptions {
  /**
   * TTL in seconds
   * @default 3600 * 24 * 1 (1 day)
   */
  ttl?: number;
}

export interface WrapWithCacheOptions {
  /**
   * Key to use for the cache
   */
  key: string;
  /**
   * TTL in seconds
   * @default 3600 * 24 * 1 (1 day)
   */
  ttl?: number;
}

export class Redis {
  // IMPORTANT: All cached values are serialized/deserialized using JSON.stringify/JSON.parse.
  // This means that complex types like Date, Map, Set, or custom classes will not be
  // preserved correctly. They will be converted to their JSON representation.
  // For Dates, this means they will become ISO 8601 strings.
  // If you need to cache complex objects with their original type integrity,
  // consider implementing custom serialization/deserialization logic or using a library
  // like superjson within the set/get methods.
  private client: RedisClient;
  private defaultTTL: number;
  private isConnected = false;
  private static instance: Redis | null = null;
  private connectingPromise: Promise<void> | null = null;

  private constructor(options: CacheOptions = {}) {
    const { url = env.REDIS_CONNECTION_STRING, defaultTTL = 3600 * 24 * 1 } = options;

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
        // Keep the promise in a failed state for a short period
        // to prevent immediate retries from all requests.
        setTimeout(() => {
          this.connectingPromise = null;
        }, 2000);
        this.isConnected = false;
        console.error("Failed to connect to Redis:", err);
      });

    return this.connectingPromise;
  }

  private async ensureConnected(): Promise<void> {
    if (this.client.isReady && this.client.isOpen) {
      return;
    }

    if (this.connectingPromise) {
      return this.connectingPromise;
    }

    // Try to connect, but don't throw on failure
    await this.connect();
  }

  isReady(): boolean {
    return this.client.isReady;
  }

  isOpen(): boolean {
    return this.client.isOpen;
  }

  async disconnect(): Promise<void> {
    if (this.isConnected || this.client.isOpen) {
      await this.client.disconnect();
      this.isConnected = false;
    }
  }

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

  async del(key: string): Promise<number> {
    await this.ensureConnected();
    try {
      return await this.client.del(key);
    } catch (error) {
      console.error("Error deleting key:", error);
      return 0;
    }
  }

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
