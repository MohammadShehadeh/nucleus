import { RedisCache } from ".";

export const cache = RedisCache.getInstance();

await cache.connect();
await cache.set("user:123", { name: "John" });
const user = await cache.get("user:123");
const hasUser = await cache.exists("user:123");
await cache.del("user:123");

cache.destroy();

console.log(user, hasUser);

const value = await cache.wrapWithCache(
  async () => {
    return await new Promise((resolve) => setTimeout(() => resolve({ name: "John" }), 1000));
  },
  { key: "user:123" }
);

console.log(value);
