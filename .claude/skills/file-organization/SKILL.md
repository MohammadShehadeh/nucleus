---
name: file-organization
description: Where files go in the Nucleus monorepo and how they are named - kebab-case filenames, .tsx only for JSX, route colocation with _components/_lib, the one-consumer rule, no barrel files, direct imports via @/ and @nucleus/* subpath exports, and no default exports outside Next.js file conventions. Use when creating, moving, or renaming files, or deciding where new code belongs.
---

# File Organization

Code style follows the `pxkit:pxkit-conventions` skill; this skill covers repo-specific patterns. On conflict, pxkit wins. (pxkit references: `naming.md`, `structure.md`.)

## Naming

- **kebab-case for every filename**, components included: `users-table.tsx`, `role-form-dialog.tsx`, `use-data-table.ts`. Never `UsersTable.tsx`.
- The filename mirrors the main export (`role-row-actions.tsx` -> `RoleRowActions`).
- **`.tsx` if and only if the file contains JSX.** Hooks, search-param parsers, routers, schemas are `.ts`.
- Identifiers: camelCase values/functions, PascalCase components/types, `is/has/should` booleans, `handle*` internal handlers, `on*` callback props.

## Exports

- Named arrow-const exports: `export const UsersTable = () => { ... }`.
- **No default exports** except Next.js file conventions: `page.tsx`, `layout.tsx`, `error.tsx`, `not-found.tsx`, `loading.tsx`, `route.ts` (named HTTP handlers), `proxy.ts` (named `proxy` + `config`), and config files that require it (`drizzle.config.ts`, `vitest.config.ts`).

## No barrels

- Never add an `index.ts` that only re-exports, and never re-export a symbol through a middleman file.
- Import the **defining file**: in the app via `@/` (`@/trpc/react`, `@/components/permissions-provider`), across packages via subpath exports (`@nucleus/ui/components/button`, `@nucleus/db/client`, `@nucleus/db/utils`, `@nucleus/validators/authentication`).
- Packages expose **per-file subpath exports** (`@nucleus/db/schema/user`, `@nucleus/db/rbac/check`, `@nucleus/db/utils`, `@nucleus/api/error-keys`, `@nucleus/ui/lib/create-safe-context`); `packages/db` and `packages/api` no longer use `index.ts` barrels or re-export middlemen. Drizzle operators come from `drizzle-orm` directly. A new package follows `packages/ui/package.json` / `packages/validators/package.json`. Confirm a subpath in the package's `exports` before importing it.

## Layout

```
apps/nextjs/src/
  app/                    # App Router; route groups (auth), (public); dashboard/
    dashboard/users/
      page.tsx            # thin server page
      _components/        # route-private client components (users-table.tsx, user-row-actions.tsx)
      _lib/               # route-private non-UI logic (search-params.ts, columns.tsx)
    api/trpc/[trpc]/route.ts, api/auth/[...all]/route.ts
  auth/                   # server.ts (initAuth + getSession), client.ts (better-auth client)
  components/             # app-wide components used by 2+ routes
  lib/error-messages.ts   # ErrorKey -> copy (getErrorMessage, authErrorKey)
  trpc/                   # react.tsx (useTRPC), server.tsx (trpc, prefetch, HydrateClient), query-client.ts
  env.ts                  # the only place that reads process.env in the app
  proxy.ts                # Next 16 proxy (not middleware.ts); owns route lists + routePermissions

packages/<name>/
  env.ts                  # package env factory (when the package has env)
  src/...                 # one concept per file, exposed via package.json "exports"
```

## Placement rules (one-consumer rule)

- A type, constant, helper, or sub-component used by **one file lives in that file**. Move it out only when a second file imports it.
- Used by one route -> that route's `_components/` or `_lib/` (underscore folders are not routable).
- Used by 2+ routes in the app -> `apps/nextjs/src/components/`, `lib/`, or `constants/`.
- Used by 2+ apps (Next.js + Expo) or by the API -> a package (`@nucleus/ui` for UI primitives, `@nucleus/validators` for shared zod schemas, `@nucleus/db` for schema/RBAC logic).
- Create a directory only when a file exists for it.
- Tests: colocated `*.test.ts` next to the pure logic they test (see `testing-patterns`).

## Imports

Biome organizes imports (`pnpm format-and-lint:fix`); don't hand-sort. Use `import type` for type-only imports.
