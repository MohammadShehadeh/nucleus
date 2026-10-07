---
name: error-handling-patterns
description: Error handling in Nucleus - the ErrorKey union in packages/api/src/error-keys.ts, throwing TRPCError with an ErrorKey message, the errorFormatter that exposes data.errorKey, resolving copy with getErrorMessage / authErrorKey in apps/nextjs/src/lib/error-messages.ts, and the 'Error in <fn>::' logging convention. Use when throwing or catching errors in tRPC routers or auth flows, handling mutation/query errors, or showing an error to the user.
---

# Error Handling

Code style follows the `pxkit:pxkit-conventions` skill; this skill covers repo-specific patterns. On conflict, pxkit wins. (pxkit reference: `errors.md`.)

**Errors are codes, not sentences.** Every expected failure reaches the client as a SCREAMING_SNAKE `errorKey`; the Next.js app turns the key into copy at render time. No user-facing string is written in a router, a hook, or a `toast` call.

## No `Result` layer

pxkit's `Result<T, K>` + shared `http` client are for services calling external APIs. In Nucleus **tRPC is the boundary**: routers throw `TRPCError`, the client gets a typed `TRPCClientError`. Don't wrap tRPC in a `Result` type or a hand-rolled `fetch` client.

## 1. Keys - `packages/api/src/error-keys.ts`

```ts
export const ERROR_KEYS = [
  "NETWORK", "UNAUTHORIZED", "PERMISSION_DENIED", "RATE_LIMITED", "VALIDATION_FAILED", "UNKNOWN",
  "ROLE_NOT_FOUND", "ROLE_NAME_TAKEN", /* ... */
  "AUTH_INVALID_CREDENTIALS", /* ... */ "AUTH_FAILED",
] as const;

export type ErrorKey = (typeof ERROR_KEYS)[number];
export const isErrorKey = (value: unknown): value is ErrorKey => ...;
```

- The `as const` array exists so `isErrorKey` can check at runtime; `ErrorKey` is derived from it. Never an `enum`.
- Shared keys are transport/session only (`NETWORK`, `UNAUTHORIZED`, `PERMISSION_DENIED`, `RATE_LIMITED`, `VALIDATION_FAILED`, `UNKNOWN`). Everything else is feature-prefixed (`ROLE_`, `PERMISSION_`, `AUTH_`) and **named by reason** (`ROLE_NOT_FOUND`, `ROLE_SYSTEM_UNDELETABLE`); an operation catch-all (`AUTH_FAILED`) only for unknown reasons.
- Imports: inside `packages/api` use `"../error-keys"`; elsewhere `@nucleus/api/error-keys`.
- Adding a key = add it to `ERROR_KEYS` **and** its copy in `apps/nextjs/src/lib/error-messages.ts` (the `Record<ErrorKey, string>` makes a missing entry a type error).

## 2. Throwing in routers

`code` is the tRPC transport code (HTTP status, retry behavior); `message` is the key:

```ts
if (!existing) {
  throw new TRPCError({ code: "NOT_FOUND", message: "ROLE_NOT_FOUND" satisfies ErrorKey });
}
```

| Situation | `code` | Key |
| --- | --- | --- |
| no session (`protectedProcedure`) | `UNAUTHORIZED` | `UNAUTHORIZED` (mapped by formatter) |
| missing permission (`requirePermission`) | `FORBIDDEN` | `PERMISSION_DENIED` |
| granting permissions you lack (`assertCanGrant`) | `FORBIDDEN` | `PERMISSION_GRANT_EXCEEDED` |
| row missing | `NOT_FOUND` | `<FEATURE>_NOT_FOUND` |
| unique violation (`checkPostgresErrorCode(error, "unique_violation")` from `@nucleus/db/utils`) | `CONFLICT` | e.g. `ROLE_NAME_TAKEN` |
| business rule | `BAD_REQUEST` / `FORBIDDEN` | reason key, e.g. `ROLE_IS_DEFAULT` |
| zod input failure | `BAD_REQUEST` (automatic) | `VALIDATION_FAILED` + `data.zodError` |

Guard clauses first, happy path unindented. Unknown errors are re-thrown untouched and surface as `UNKNOWN`.

## 3. `errorFormatter` - `packages/api/src/trpc.ts`

Resolves every error to a key: the thrown message if `isErrorKey`, else `VALIDATION_FAILED` for zod errors, else `ERROR_KEY_BY_CODE[code]`, else `UNKNOWN`. It replaces `shape.message` with the key and sets `data.errorKey` (plus `data.zodError`), so internal messages never leave the server. Extend `ERROR_KEY_BY_CODE` rather than special-casing in routers.

## 4. Logging

`try/catch` only around I/O you need to translate (DB constraint, email, Redis, better-auth). Log with the greppable prefix, then throw a key; raw details stop at the log:

```ts
try {
  await sendVerificationEmail(input);
} catch (error) {
  console.error("Error in sendVerificationEmail::", error);
  throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "UNKNOWN" satisfies ErrorKey });
}
```

## 5. Client copy - `apps/nextjs/src/lib/error-messages.ts`

- `getErrorMessage(error: unknown)` accepts an `ErrorKey` or a `TRPCClientError` (reads `error.data.errorKey`; no `data` -> `NETWORK`; anything else -> `UNKNOWN`).
- `authErrorKey({ code, status })` maps a better-auth client error to an `ErrorKey` (429 -> `RATE_LIMITED`, unknown codes -> `AUTH_FAILED`). This is the **only** place better-auth codes are mapped.

```tsx
const deleteRole = useMutation(
  trpc.roles.delete.mutationOptions({
    onSuccess: () => queryClient.invalidateQueries(trpc.roles.list.queryFilter()),
    onError: (error) => toast.error(getErrorMessage(error)),
  })
);

const response = await signIn.email({ email, password, callbackURL: "/" });
if (response.error) toast.error(getErrorMessage(authErrorKey(response.error)));
```

- **Never render `error.message`** (tRPC or better-auth). Inline errors use `<p role="alert">{getErrorMessage(error)}</p>`.
- Queries: read the query's `error`/`status` and render via `getErrorMessage`; don't copy errors into `useState`.
- Field validation messages come from the zod schema and render through `FieldError` (see `schema-validation`); submit failures use the key path above.

## Don'ts

- No `TRPCError` with a sentence message; no hardcoded error strings in components.
- No `error.message.includes(...)` sniffing - use `checkPostgresErrorCode` or the better-auth `code`.
- No `process.env.NODE_ENV` around logging; use `env` from `@/env` if it matters.
- No class error boundaries for data errors; Next.js `error.tsx` handles render crashes.
