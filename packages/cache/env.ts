import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod/v4";

export function cacheEnv() {
  return createEnv({
    server: {
      REDIS_HOST: z.string().min(1),
      REDIS_PORT: z.coerce.number().min(1),
      REDIS_PASSWORD: z.string().min(1),
    },
    experimental__runtimeEnv: {},
    skipValidation: !!process.env.CI || process.env.npm_lifecycle_event === "lint",
  });
}
