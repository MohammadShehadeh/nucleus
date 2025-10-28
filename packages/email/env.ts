import { createEnv } from "@t3-oss/env-core";
import { z } from "zod/v4";

export function emailEnv() {
  return createEnv({
    server: {
      RESEND_FROM: z.email(),
      RESEND_TOKEN: z.string().startsWith("re_").min(1),
    },
    runtimeEnv: process.env,
    skipValidation: !!process.env.CI || process.env.npm_lifecycle_event === "lint",
  });
}
