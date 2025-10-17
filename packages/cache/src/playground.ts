import { Redis } from ".";

export const redis = Redis.getInstance();

await redis.connect();
await redis.set("user:123", { name: "John" });
const user = await redis.get("user:123");
const hasUser = await redis.exists("user:123");
await redis.del("user:123");

redis.destroy();

console.log(user, hasUser);

const value = await redis.wrapWithCache(
  async () => {
    return await new Promise((resolve) => setTimeout(() => resolve({ name: "John" }), 1000));
  },
  { key: "user:123" }
);

console.log(value);
