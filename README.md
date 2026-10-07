# Nucleus

Full-stack TypeScript monorepo (Turborepo + pnpm) with a Next.js web app, an Expo mobile app, and shared packages for API, auth, database, RBAC, caching, and UI.

## Stack

- **Web:** Next.js 16, React 19, Tailwind CSS v4, shadcn/ui
- **Mobile:** Expo, Expo Router, NativeWind
- **API:** tRPC v11 + TanStack Query
- **Auth:** better-auth (email/password + Google), role-based access control
- **Data:** PostgreSQL + Drizzle ORM, Redis
- **Email:** Resend + React Email
- **Tooling:** Biome (format + lint), Vitest, Husky + lint-staged

## Structure

```text
apps
  ├─ nextjs        Web app: auth pages, dashboard (users, roles, media library), tRPC + auth API routes
  └─ expo          Mobile app consuming the same tRPC API
packages
  ├─ api           tRPC routers (auth, users, roles, rbac)
  ├─ auth          better-auth config + RBAC helpers
  ├─ db            Drizzle schema, client, RBAC permissions, seed
  ├─ cache         Redis client
  ├─ rate-limit    Redis-backed rate limiter
  ├─ email         Resend client + React Email templates
  ├─ validators    Shared Zod schemas
  ├─ ui            Shared shadcn/ui components, hooks, providers
  ├─ i18n          (placeholder)
  └─ upload        (placeholder)
tooling
  ├─ tailwind      Shared Tailwind config
  ├─ typescript    Shared tsconfig
  └─ github        CI setup action
```

## Getting started

**Requirements:** Node >= 24, pnpm >= 12, Docker (for local services).

```bash
# 1. Install dependencies
pnpm i

# 2. Start Postgres (5432), Redis (6379), and MinIO (9000, console 9001)
docker compose up -d

# 3. Configure environment
cp .env.example .env
```

Fill in `.env`:

| Variable | Notes |
| --- | --- |
| `POSTGRES_URL` | Local: `postgres://postgres:postgres@localhost:5432/app` |
| `REDIS_CONNECTION_STRING` | Local: `redis://localhost:6379` |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `NEXT_PUBLIC_BASE_URL` | e.g. `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth credentials |
| `RESEND_FROM` / `RESEND_TOKEN` | Resend sender and API key |
| `SUPER_ADMIN_EMAILS` | Comma-separated emails granted `super_admin` |

```bash
# 4. Push the schema and seed roles/permissions
pnpm db:push
pnpm db:seed

# 5. Run
pnpm dev:next   # Next.js app only (http://localhost:3000)
pnpm dev        # all apps, including Expo
```

For Expo on a simulator, run `pnpm -F @nucleus/expo dev:ios` or `dev:android`.

## Scripts

Root (`pnpm <script>`):

| Script | Description |
| --- | --- |
| `dev` | Run all apps/packages in watch mode |
| `dev:next` | Run the Next.js app and its dependencies |
| `build` | Build everything |
| `typecheck` | Type-check all workspaces |
| `test` | Run tests (Vitest) |
| `format-and-lint` | Biome check |
| `format-and-lint:fix` | Biome check with autofix |
| `db:push` | Push Drizzle schema to the database |
| `db:seed` | Seed RBAC roles/permissions and super admins |
| `db:studio` | Open Drizzle Studio |
| `auth:generate` | Regenerate better-auth schema into `packages/db/src/auth-schema.ts` |
| `ui-add` | Add shadcn/ui components to `packages/ui` |
| `dep:check` | Check dependency consistency (sherif); runs on `postinstall` |
| `clean` | Remove root `node_modules` |
| `clean:workspaces` | Clean every workspace's build output and `node_modules` |

Useful workspace scripts (`pnpm -F <package> <script>`):

- `@nucleus/db`: `generate`, `migrate`, `pull`, `drop`, `test:watch`
- `@nucleus/nextjs`: `start` (serve production build)
- `@nucleus/expo`: `dev:ios`, `dev:android`, `ios`, `android`

## Deployment

`apps/nextjs/Dockerfile` builds a standalone Next.js image. Build it from the repo root:

```bash
docker build -f apps/nextjs/Dockerfile -t nucleus-web .
```

> The Dockerfile copies the root `.env` into the image, so it must exist at build time.

CI (`.github/workflows/ci.yml`) runs lint, package builds, and typecheck.

## License

[MIT](./LICENSE). Based on [create-t3-turbo](https://github.com/t3-oss/create-t3-turbo).
