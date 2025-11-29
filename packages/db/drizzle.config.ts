import type { Config } from "drizzle-kit";
import { dbEnv } from "./env";

const env = dbEnv();

const nonPoolingUrl = env.POSTGRES_URL.replace(":6543", ":5432");

export default {
  schema: "./src/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: { url: nonPoolingUrl },
  casing: "snake_case",
  out: "./drizzle",
} satisfies Config;
