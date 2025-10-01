import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod/v4";

export function dbEnv() {
  return createEnv({
    server: {
      POSTGRES_URL: z.string().min(1),
    },
    runtimeEnv: {
      POSTGRES_URL: process.env.POSTGRES_URL,
    },
    skipValidation: !!process.env.CI || process.env.npm_lifecycle_event === "lint",
  });
}
