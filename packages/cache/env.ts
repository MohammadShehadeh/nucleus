import { createEnv } from "@t3-oss/env-core";
import { z } from "zod/v4";

export function cacheEnv() {
  return createEnv({
    server: {
      REDIS_CONNECTION_STRING: z.string().min(1),
    },
    runtimeEnv: process.env,
    skipValidation: !!process.env.CI || process.env.npm_lifecycle_event === "lint",
  });
}
