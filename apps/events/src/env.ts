import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod/v4";

export function eventsEnv() {
  return createEnv({
    server: {
      KAFKA_GROUP_ID: z.string(),
      PRODUCER_INTERVAL_MS: z.coerce.number().int().positive().default(10000),
      KAFKA_BROKERS: z.string(),
      KAFKA_CLIENT_ID: z.string(),
      KAFKA_LOG_LEVEL: z.enum(["NOTHING", "ERROR", "WARN", "INFO", "DEBUG"]),
    },
    runtimeEnv: {
      KAFKA_GROUP_ID: process.env.KAFKA_GROUP_ID,
      PRODUCER_INTERVAL_MS: process.env.PRODUCER_INTERVAL_MS,
      KAFKA_BROKERS: process.env.KAFKA_BROKERS,
      KAFKA_CLIENT_ID: process.env.KAFKA_CLIENT_ID,
      KAFKA_LOG_LEVEL: process.env.KAFKA_LOG_LEVEL,
    },
    skipValidation:
      !!process.env.CI || process.env.npm_lifecycle_event === "lint",
  });
}
