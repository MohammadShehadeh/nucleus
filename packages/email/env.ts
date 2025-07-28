import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod/v4";

export function emailEnv() {
  return createEnv({
    server: {
      RESEND_FROM: z.email(),
      RESEND_TOKEN: z.string().startsWith("re_").min(1),
    },
    runtimeEnv: {
      RESEND_FROM: process.env.RESEND_FROM,
      RESEND_TOKEN: process.env.RESEND_TOKEN,
    },
    skipValidation:
      !!process.env.CI || process.env.npm_lifecycle_event === "lint",
  });
}
