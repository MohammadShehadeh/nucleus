---
name: env-config-patterns
description: Environment variables in Nucleus - per-package t3 env-core factories in packages/*/env.ts, composition in apps/nextjs/src/env.ts via extends, NEXT_PUBLIC_ client vars, turbo.json globalEnv, and the rule that process.env is read only in env.ts files. Use when adding, reading, or changing an environment variable.
---

# Environment Configuration

Code style follows the `pxkit:pxkit-conventions` skill; this skill covers repo-specific patterns. On conflict, pxkit wins.

**Read env only through `env.ts`.** Never `process.env` in feature code - import `env` from `@/env` in the app, or call the package's factory in a package.

## Package factories (`@t3-oss/env-core`)

Existing: `packages/auth/env.ts` (`authEnv`), `packages/db/env.ts` (`dbEnv`), `packages/cache/env.ts` (`cacheEnv`), `packages/email/env.ts` (`emailEnv`). Each is exported as the `./env` subpath.

```ts
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod/v4";

export const dbEnv = () =>
  createEnv({
    server: {
      POSTGRES_URL: z.string().min(1),
    },
    runtimeEnv: process.env,
    skipValidation: !!process.env.CI || process.env.npm_lifecycle_event === "lint",
  });
```

- Only the variables that package uses.
- Production-only requirements via a conditional schema (see `AUTH_SECRET` in `authEnv`).
- Numbers: `z.coerce.number()`. Lists: a string parsed at the consumer (see `SUPER_ADMIN_EMAILS` in `apps/nextjs/src/auth/server.ts`).
- Inside the package, call the factory (`const env = dbEnv();`, as `packages/db/src/client.ts` and `packages/db/drizzle.config.ts` do).

## App composition (`apps/nextjs/src/env.ts`, `@t3-oss/env-nextjs`)

```ts
export const env = createEnv({
  extends: [authEnv(), vercel(), dbEnv(), cacheEnv(), emailEnv()],
  shared: { NODE_ENV: z.enum(["development", "production", "test"]).default("development").optional() },
  server: {},
  client: { NEXT_PUBLIC_BASE_URL: z.url() },
  experimental__runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
  skipValidation: !!process.env.CI || process.env.npm_lifecycle_event === "lint",
});
```

- New package factory -> add it to `extends`.
- Client vars: `NEXT_PUBLIC_` prefix, declared under `client` **and** listed in `experimental__runtimeEnv`.

## Adding a variable - checklist

1. Add it to the owning `env.ts` (package or app).
2. Add it to `.env.example` (never commit real values; scripts load `../../.env` via `dotenv-cli`).
3. Add it to `turbo.json` `globalEnv` (or `globalPassThroughEnv` for platform vars) so Turbo caching and tasks see it.
4. Read it via `env.X` only.

Naming: SCREAMING_SNAKE_CASE, grouped by prefix (`GOOGLE_*`, `RESEND_*`, `REDIS_*`).
