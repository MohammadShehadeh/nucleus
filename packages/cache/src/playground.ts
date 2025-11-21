import { Redis } from ".";

export const redis = Redis.getInstance();

await redis.set("user:123", { name: "John" });
const user = await redis.get("user:123");
console.log(user);

const hasUser = await redis.exists("user:123");
await redis.del("user:123");
console.log(hasUser);

const value = await redis.wrapWithCache(
  async () => {
    return await new Promise((resolve) => setTimeout(() => resolve({ name: "John" }), 1000));
  },
  { key: "user:123" }
);

console.log(value);

// export interface RetryOptions {
//   retries?: number;           // max attempts
//   delayMs?: number;           // initial delay between attempts
//   factor?: number;            // exponential backoff factor
//   onRetry?: (err: unknown, attempt: number) => void; // callback on failure
// }

// export async function retry<T>(
//   fn: () => Promise<T>,
//   options: RetryOptions = {}
// ): Promise<T> {
//   const {
//     retries = 5,
//     delayMs = 1000,
//     factor = 1,
//     onRetry,
//   } = options;

//   let attempt = 0;

//   while (true) {
//     try {
//       return await fn();
//     } catch (err) {
//       attempt++;
//       if (attempt > retries) {
//         throw err;
//       }

//       if (onRetry) onRetry(err, attempt);

//       const waitTime = delayMs * Math.pow(factor, attempt - 1);
//       await new Promise((resolve) => setTimeout(resolve, waitTime));
//     }
//   }
// }
