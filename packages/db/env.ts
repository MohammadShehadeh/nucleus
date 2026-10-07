import { createEnv } from "@t3-oss/env-core";
import { z } from "zod/v4";

export function dbEnv() {
  return createEnv({
    server: {
      POSTGRES_URL: z.string().min(1),
      // Comma-separated emails promoted to super_admin by the RBAC seed.
      SUPER_ADMIN_EMAILS: z.string().optional(),
    },
    runtimeEnv: process.env,
    skipValidation: !!process.env.CI || process.env.npm_lifecycle_event === "lint",
  });
}
