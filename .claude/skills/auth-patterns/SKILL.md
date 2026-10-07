---
name: auth-patterns
description: Authentication and RBAC in Nucleus with better-auth - initAuth in @nucleus/auth, getSession and the auth client in apps/nextjs/src/auth, the Next 16 proxy.ts route guard, /login /register /reset-password, session-enriched permissions, requirePermission/assertCanGrant tRPC procedures, and usePermissions/Can on the client. Use when working with sessions, sign-in/up/out, route protection, roles, or permissions.
---

# Auth & RBAC

Code style follows the `pxkit:pxkit-conventions` skill; this skill covers repo-specific patterns. On conflict, pxkit wins.

## Where things live

| Concern | File |
| --- | --- |
| better-auth config (`initAuth`, `Auth`, `Session` types) | `packages/auth/src/index.ts` |
| Role assignment on signup, session RBAC loading (Redis-cached) | `packages/auth/src/rbac.ts` |
| Auth env (`AUTH_SECRET`, `GOOGLE_*`, `SUPER_ADMIN_EMAILS`) | `packages/auth/env.ts` |
| Server instance + `getSession` (React `cache`) | `apps/nextjs/src/auth/server.ts` (`server-only`) |
| Client (`signIn`, `signUp`, `signOut`) | `apps/nextjs/src/auth/client.ts` |
| Route guard | `apps/nextjs/src/proxy.ts` (Next 16 proxy, **not** `middleware.ts`) |
| Route lists (`protectedRoutes`, `authRoutes`, `routePermissions`) | inside `apps/nextjs/src/proxy.ts` |
| Permission catalog + checks | `packages/db/src/rbac/{permissions,check,roles,cache}.ts` |
| tRPC guards | `packages/api/src/trpc.ts` |
| Client permission context (`createSafeContext` from `@nucleus/ui/lib/create-safe-context`) | `apps/nextjs/src/components/permissions-provider.tsx` |
| Auth pages | `apps/nextjs/src/app/(auth)/{login,register,reset-password}/page.tsx` |
| Auth handler | `apps/nextjs/src/app/api/auth/[...all]/route.ts` |
| Regenerate auth schema | `pnpm auth:generate` |

## Configuration facts

- Email/password with `requireEmailVerification: true` and `autoSignIn: false`; Google OAuth; account linking trusts Google.
- Plugins: `oAuthProxy`, `expo()` (with `trustedOrigins: ["expo://"]`), `customSession` (adds `roleId`, `roleName`, `roleSlug`, `permissions` to `session.user`), `nextCookies()` **last**.
- `user.roleId` is an additional field with `input: false` - set only server-side (signup hook, `users.setRole`).
- New users get the `isDefault` role, or `super_admin` if their email is in `SUPER_ADMIN_EMAILS`.

## Reading the session

Server (RSC, layouts, proxy):

```tsx
import { getSession } from "@/auth/server";

const session = await getSession();
if (!session) redirect("/login");
```

tRPC: `ctx.session` (nullable in `publicProcedure`, non-null in `protectedProcedure`). Client: prefer data passed down from the server (e.g. `PermissionsProvider` seeded in the dashboard layout) or `trpc.auth.getSession.queryOptions()`.

## Signing in/up/out

```tsx
const response = await signIn.email({ email, password, callbackURL: "/" });
if (response.error) {
  toast.error(getErrorMessage(authErrorKey(response.error)));
}
```

better-auth returns `{ data, error }`; map `error` with `authErrorKey` and resolve copy with `getErrorMessage` (both in `apps/nextjs/src/lib/error-messages.ts`); never render `error.message` (see `error-handling-patterns`). Auth forms use `Field`/`FieldGroup` + react-hook-form + the schemas in `@nucleus/validators/authentication` (see `schema-validation`).

## Route protection (proxy.ts)

Order: rate limit (`RedisRateLimiter` from `@nucleus/rate-limit`) -> `getSession()` -> redirect unauthenticated users away from `protectedRoutes` and authenticated users away from `authRoutes` -> check `routePermissions` with `hasPermission`. To guard a new route, add an entry to the route lists at the top of `proxy.ts`; don't add new branching logic.

## Authorization in tRPC

```ts
export const rolesRouter = {
  create: requirePermission("role:create")
    .input(createRoleInput)
    .mutation(async ({ ctx, input }) => {
      assertCanGrant(ctx.session.user.permissions ?? [], input.permissions);
      // ...
    }),
} satisfies TRPCRouterRecord;
```

- `publicProcedure` -> `protectedProcedure` (session required, `UNAUTHORIZED`) -> `requirePermission(...keys)` (all keys required, wildcard `*` passes, else `FORBIDDEN` / `PERMISSION_DENIED`).
- `assertCanGrant` prevents privilege escalation when creating/editing roles or assigning them (`PERMISSION_GRANT_EXCEEDED`).
- The router is the source of truth; client gating is UX only.
- Permission keys are `resource:action` literals typed as `PermissionKey`; add new ones to the catalog in `packages/db/src/rbac/permissions.ts`, then `pnpm db:seed` to sync system roles.
- After changing a role's permissions, invalidate its Redis cache (`roleCacheKey(roleId)`), as `packages/api/src/router/roles.ts` does.

## Client gating

```tsx
const { can } = usePermissions();
if (!can("user:assign-role")) return null;

<Can permission="role:create">
  <Button onClick={handleCreate}>New role</Button>
</Can>
```

`Can` also accepts `anyOf` / `allOf` and a `fallback`.

## Env

Only via `env` (`@/env` in the app, `authEnv()` in the package). Never `process.env` in auth code.
