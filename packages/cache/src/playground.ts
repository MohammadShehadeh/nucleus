import { RedisCache } from ".";

export const cache = new RedisCache();

await cache.connect();
await cache.set("user:123", { name: "John" });
const user = await cache.get("user:123");
const hasUser = await cache.exists("user:123");
await cache.del("user:123");

cache.destroy();

console.log(user, hasUser);
