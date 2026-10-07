---
name: project-architecture
description: High-level map of the Nucleus monorepo (pnpm + Turborepo) - what each app and @nucleus/* package owns, how data flows from Drizzle schema through tRPC to Next.js via useTRPC/TanStack Query, and the import aliases. Use to orient before working across packages or deciding which package owns new code.
---

# Nucleus Architecture

Code style follows the `pxkit:pxkit-conventions` skill; this skill covers repo-specific patterns. On conflict, pxkit wins.

pnpm workspaces (`apps/*`, `packages/*`, `tooling/*`) + Turborepo. Node >= 24, pnpm 12, TypeScript 7, Biome.

## apps/

- `apps/nextjs` (`@nucleus/nextjs`) - Next.js 16 App Router, React 19, Tailwind v4. Alias `@/` -> `apps/nextjs/src`. Hosts the tRPC (`app/api/trpc/[trpc]`) and better-auth (`app/api/auth/[...all]`) handlers. `proxy.ts` guards routes. React Compiler is **not** enabled.
- `apps/expo` - React Native client using the same tRPC router and better-auth (`@better-auth/expo`).

## packages/

| Package | Owns |
| --- | --- |
| `@nucleus/api` | tRPC routers (`auth`, `rbac`, `roles`, `users`), procedures, `ErrorKey` union (`@nucleus/api/error-keys`), `RouterInputs`/`RouterOutputs` |
| `@nucleus/auth` | better-auth config (`initAuth`), signup role assignment, session RBAC enrichment |
| `@nucleus/db` | Drizzle schema + drizzle-zod schemas (`@nucleus/db/schema/<file>`), `db` client (`@nucleus/db/client`), RBAC catalog/checks (`@nucleus/db/rbac/<file>`), helpers (`@nucleus/db/utils`), seeds |
| `@nucleus/cache` | Redis client (`Redis.getInstance()`, `wrapWithCache`) |
| `@nucleus/rate-limit` | `RedisRateLimiter` (used in `proxy.ts`) |
| `@nucleus/email` | Email templates + sending |
| `@nucleus/i18n` | i18n setup |
| `@nucleus/ui` | shadcn/ui components, data-table components/hooks, `cn`, formatters, providers |
| `@nucleus/upload` | File upload utilities |
| `@nucleus/validators` | zod schemas shared by client and server (`authentication.ts`, `data-table.ts`) |

`tooling/`: `typescript` (`@nucleus/tsconfig`), `tailwind`, `github`.

Packages with env vars ship an `env.ts` factory (`authEnv()`, `dbEnv()`, ...) composed by `apps/nextjs/src/env.ts`.

## Data flow

1. Table in `packages/db/src/schema/*.ts` (+ `createInsertSchema`/`createSelectSchema`); `pnpm db:push`.
2. Router in `packages/api/src/router/<domain>.ts` with `requirePermission(...)`, zod/v4 input, `ctx.db` query; register in `root.ts`. Failures throw `TRPCError` with an `ErrorKey`.
3. Server page: `await prefetch(trpc.x.y.queryOptions(input))` + `<HydrateClient>` from `@/trpc/server`.
4. Client component: `const trpc = useTRPC()` from `@/trpc/react`; `useQuery(trpc.x.y.queryOptions(input))`, `useMutation(trpc.x.y.mutationOptions({ ... }))`, invalidate with `queryClient.invalidateQueries(trpc.x.y.queryFilter())`.
5. Forms: react-hook-form + `zodResolver` + `Field`/`FieldGroup` from `@nucleus/ui/components/field`; errors via `getErrorMessage` from `@/lib/error-messages`.

## Imports

- App code: `@/...` to the defining file.
- Cross-package: direct per-file subpaths from the package's `exports` (`@nucleus/ui/components/button`, `@nucleus/db/client`, `@nucleus/db/schema/user`, `@nucleus/db/rbac/check`). No barrels or re-export middlemen; drizzle operators from `drizzle-orm`.
- Types from tRPC: `RouterOutputs` / `RouterInputs` from `@nucleus/api`.

Related skills: `api-patterns`, `auth-patterns`, `data-table-patterns`, `database-patterns`, `error-handling-patterns`, `file-organization`, `turborepo-patterns`.
