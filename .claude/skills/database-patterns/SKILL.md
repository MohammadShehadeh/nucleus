---
name: database-patterns
description: Drizzle ORM + PostgreSQL in Nucleus - table and drizzle-zod schema conventions in packages/db/src/schema, relations, the db client at @nucleus/db/client, db:push/db:seed/db:studio workflow, idempotent seeders, and query helpers (takeFirstOrNull, checkPostgresErrorCode). Use when creating or changing tables, writing queries, or adding seed data.
---

# Database Patterns

Code style follows the `pxkit:pxkit-conventions` skill; this skill covers repo-specific patterns. On conflict, pxkit wins.

## Layout (`packages/db`)

- `src/schema/<domain>.ts` - tables + their drizzle-zod schemas (`user.ts`: user/session/account/verification; `rbac.ts`: `role`, `permissionKeySchema`; `media-library.ts`).
- `src/schema/relations/<domain>.ts` - Drizzle `relations()`.
- `src/client.ts` - `db` (postgres-js, `casing: "snake_case"`, URL from `dbEnv()`). Import as `@nucleus/db/client`; inside tRPC use `ctx.db`.
- `src/utils.ts` - `takeFirstOrNull`, `checkPostgresErrorCode(error, "unique_violation")`.
- `src/rbac/` - permission catalog, checks, role constants, cache keys (with colocated tests).
- `src/seed/` - `index.ts` runs seeders in order; `rbac.ts` upserts system roles.
- `drizzle.config.ts` - schema entry, `casing: "snake_case"`, out `./drizzle`.
- `env.ts` - `dbEnv()` (`POSTGRES_URL`).

Import per file (`@nucleus/db/schema/<file>`, `@nucleus/db/rbac/<file>`, `@nucleus/db/utils`); no barrels. Check `packages/db/package.json` `exports`.

## Tables

```ts
export const role = pgTable("role", (t) => ({
  id: t.text().primaryKey(),
  name: t.text().notNull(),
  createdAt: t.timestamp().notNull().defaultNow(),
  updatedAt: t.timestamp({ mode: "date", withTimezone: true }).$onUpdateFn(() => new Date()),
}));

export const roleInsertSchema = createInsertSchema(role);
export const roleSelectSchema = createSelectSchema(role);
```

- Callback column builder `(t) => ({ ... })`; camelCase keys (snake_case in SQL via `casing`).
- `id: t.text().primaryKey()`, `createdAt`/`updatedAt` as above.
- Foreign keys: `.references(() => parent.id, { onDelete: "cascade" | "set null" })` - choose deliberately (`user.roleId` uses `set null`).
- drizzle-zod insert/select schemas in the **same file** as the table (see `schema-validation`).
- Types: `typeof role.$inferSelect` / `$inferInsert`, or `RouterOutputs` on the client.
- better-auth tables (`user`, `session`, `account`, `verification`) live in `schema/user.ts`; regenerate with `pnpm auth:generate` when the auth config changes, then reconcile by hand.

## Queries

- Prefer the SQL-like builder used across routers: `ctx.db.select({...}).from(t).where(...)`, wrapped in `takeFirstOrNull(...)` for single rows.
- Select explicit columns when joining or when the client needs a subset.
- Operators (`eq`, `and`, `ilike`, `inArray`, ...) from `drizzle-orm`.
- Multi-step writes in `ctx.db.transaction(async (tx) => ...)` (see `roles.setDefault`).
- Translate constraint errors with `checkPostgresErrorCode`, then throw an `ErrorKey` (see `error-handling-patterns`).

## Workflow

```bash
pnpm db:push     # sync schema to the DB (dev workflow; no migration files committed today)
pnpm db:seed     # run seeders (loads ../../.env)
pnpm db:studio   # Drizzle Studio
pnpm -F @nucleus/db generate | migrate   # drizzle-kit migrations when a migration workflow is needed
```

Review the push diff before confirming destructive changes.

## Seeds

- Every seeder is **idempotent** (`onConflictDoUpdate` / `onConflictDoNothing`), safe to rerun.
- Add a seeder by exporting `seedX` from `src/seed/<topic>.ts` and appending it to the `seeders` list in `src/seed/index.ts` (order matters when later seeders depend on earlier rows).
- New permission keys: add to the catalog in `src/rbac/permissions.ts`, then `pnpm db:seed` to update system roles.
