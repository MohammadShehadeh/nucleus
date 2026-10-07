---
name: api-patterns
description: tRPC v11 API conventions in Nucleus - routers in packages/api/src/router (auth, rbac, roles, users) registered in root.ts, publicProcedure/protectedProcedure/requirePermission, zod/v4 inputs, Drizzle via ctx.db, errorKey TRPCErrors, and consuming procedures from Next.js with useTRPC + TanStack Query or prefetch/HydrateClient. Use when creating or modifying routers, procedures, or the code that calls them.
---

# tRPC API Patterns

Code style follows the `pxkit:pxkit-conventions` skill; this skill covers repo-specific patterns. On conflict, pxkit wins.

## Layout

- `packages/api/src/trpc.ts` - context (`authApi`, `session`, `db`), `errorFormatter`, `createTRPCRouter`, `publicProcedure`, `protectedProcedure`, `requirePermission(...keys)`, `assertCanGrant`.
- `packages/api/src/router/<domain>.ts` - one router per domain: `auth.ts` (`getSession`), `rbac.ts` (`catalog`), `roles.ts` (`list`, `options`, `byId`, `create`, `update`, `delete`, `setDefault`), `users.ts` (`getById`, `list`, `setRole`, ...).
- `packages/api/src/root.ts` - `appRouter` registers each router. `packages/api/src/index.ts` (`@nucleus/api`) exposes `AppRouter`, `RouterInputs`, `RouterOutputs`, `appRouter`, `createCaller`, `createTRPCContext`.
- `packages/api/src/error-keys.ts` (`@nucleus/api/error-keys`) - `ErrorKey` union + `isErrorKey`.

## Router shape

```ts
import { eq } from "drizzle-orm";
import { role } from "@nucleus/db/schema/rbac";
import { takeFirstOrNull } from "@nucleus/db/utils";
import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";
import type { ErrorKey } from "../error-keys";
import { requirePermission } from "../trpc";

export const rolesRouter = {
  byId: requirePermission("role:read")
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const found = takeFirstOrNull(await ctx.db.select().from(role).where(eq(role.id, input.id)));
      if (!found) {
        throw new TRPCError({ code: "NOT_FOUND", message: "ROLE_NOT_FOUND" satisfies ErrorKey });
      }
      return found;
    }),
} satisfies TRPCRouterRecord;
```

- Export `<domain>Router` as a plain object with `satisfies TRPCRouterRecord`; register it in `root.ts`.
- Procedure choice: `publicProcedure` (no session needed) -> `protectedProcedure` (any signed-in user) -> `requirePermission("resource:action")` for anything admin-facing. See `auth-patterns`.
- Inputs: `zod/v4`. Derive from drizzle-zod schemas where they fit (`userSelectSchema.pick({ id: true })`), otherwise declare a named schema above the router (`createRoleInput`). Shared client+server schemas go in `@nucleus/validators`.
- DB: use **`ctx.db`** in procedures. Outside tRPC (auth hooks, seeds) import `db` from `@nucleus/db/client`. Tables from the schema subpath, helpers (`takeFirstOrNull`, `checkPostgresErrorCode`) from `@nucleus/db/utils`.
- Imports are direct, per-file: query operators from `drizzle-orm`, tables from `@nucleus/db/schema/<file>` (`role` in `schema/rbac`, `user` in `schema/user`), RBAC from `@nucleus/db/rbac/<file>` (`check`, `permissions`, `roles`, `cache`), helpers from `@nucleus/db/utils`. No `@nucleus/db` root or `index.ts` barrels; confirm the subpath in `packages/db/package.json` `exports`.
- Errors: `TRPCError({ code, message: "KEY" satisfies ErrorKey })` with keys from `packages/api/src/error-keys.ts`, never a sentence. Unique violations -> `checkPostgresErrorCode(error, "unique_violation")` -> `CONFLICT`. Details in `error-handling-patterns`.
- Mutations that change role permissions invalidate the role cache (`roleCacheKey`) via `Redis.getInstance()` from `@nucleus/cache`.
- Lists follow the data-table contract (`{ page, perPage, sort, ...filters }` -> `{ data, pageCount }`); see `data-table-patterns`.
- Return only what the client reads (select explicit columns when joining, as `users.getById` does).
- A helper used by one router stays in that router file (`slugify`, `invalidateRoleCache` in `roles.ts`).

## Consuming from Next.js

Client components (`@/trpc/react`):

```tsx
const trpc = useTRPC();
const queryClient = useQueryClient();

const { data, status } = useQuery(trpc.roles.byId.queryOptions({ id }));

const deleteRole = useMutation(
  trpc.roles.delete.mutationOptions({
    onSuccess: () => queryClient.invalidateQueries(trpc.roles.list.queryFilter()),
    onError: (error) => toast.error(getErrorMessage(error)),
  })
);
```

Server components (`@/trpc/server`): `await prefetch(trpc.x.y.queryOptions(input))` then render client children inside `<HydrateClient>`. The `api` caller (`createCaller`) is for server-only one-off reads, not for data a client component also queries.

Never `useState` + `useEffect` + `fetch` for server data, and never the legacy `api.x.useQuery()` style.

## Types on the client

`RouterOutputs["users"]["list"]["data"][number]` and `RouterInputs[...]` from `@nucleus/api` - never hand-write a DTO shape that a procedure already defines.
