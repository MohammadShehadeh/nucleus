---
name: typescript-patterns
description: TypeScript rules for Nucleus - interface for object shapes and type for unions, no inline type literals, no enum, no any, derive types from zod/drizzle/tRPC instead of restating them, status unions over parallel booleans, and React 19 ref-as-prop instead of forwardRef. Use when declaring types, props, state, or reviewing type quality.
---

# TypeScript Patterns

Code style follows the `pxkit:pxkit-conventions` skill; this skill covers repo-specific patterns. On conflict, pxkit wins. (pxkit reference: `typescript.md`.)

Strict mode comes from `@nucleus/tsconfig` (`tooling/typescript/base.json`); TypeScript 7. Biome enforces `noUnusedImports`/`noUnusedVariables`. Run `pnpm typecheck`.

## interface vs type

- `interface` for object shapes (props, context values, options). Props are `interface <Component>Props`, no `I` prefix.
- `type` for unions, aliases, and derived types.
- **Never inline a type literal.** Declare it above first use.

```tsx
// Bad
export function UserRowActions({ user }: { user: User }) {}
export function HydrateClient(props: { children: React.ReactNode }) {}

// Good
interface UserRowActionsProps {
  user: User;
}

export const UserRowActions = ({ user }: UserRowActionsProps) => { ... };
```

Composing declared names inline is fine: `RouterOutputs["users"]["list"]`, `Promise<SearchParams>`.

## Derive, don't restate

The sources of truth already exist - derive from them:

| Source | Derive with |
| --- | --- |
| tRPC procedure output/input | `RouterOutputs["users"]["list"]["data"][number]`, `RouterInputs[...]` from `@nucleus/api` |
| Drizzle table | `typeof role.$inferSelect` / `$inferInsert` |
| zod schema | `z.infer<typeof loginSchema>` (`import { z } from "zod/v4"`) |
| nuqs cache | `Awaited<ReturnType<typeof searchParamsCache.parse>>` |
| `as const` catalog | `keyof typeof X`, `(typeof X)[number]` (see `PermissionKey` in `packages/db/src/rbac/permissions.ts`) |

Annotate only real contracts: params, exported signatures, mapper returns. Let initialized consts and obvious returns infer.

## Unions, never enum

```ts
type Status = "idle" | "loading" | "success" | "error";
const [status, setStatus] = useState<Status>("idle");
```

- String-literal unions or `as const` + derived type. **No `enum`.**
- One `status` union per async flow - never parallel `isLoading`/`isError`/`isSuccess` booleans. For tRPC calls use TanStack Query's own `status`/`isPending`; don't mirror them into state.
- Model invalid states out (discriminated unions when a payload belongs to a state, e.g. `{ status: "error"; errorKey: ErrorKey }`).

## any / unknown

- `unknown` over `any`; narrow with type guards (`checkPostgresErrorCode` in `@nucleus/db/utils` is the model).
- If `any` is truly unavoidable (e.g. the generic `prefetch` in `apps/nextjs/src/trpc/server.tsx`), add a lint-ignore comment explaining why.
- No `Function`, `object`, or `{}` types.

## React 19

- **No `forwardRef`.** `ref` is a regular prop: `interface InputProps extends React.ComponentProps<"input"> {}` already includes it.
- `children: React.ReactNode`.
- React Compiler is **not** enabled: `useMemo`/`useCallback` only for measured hot paths or referential stability a dependency needs (e.g. module-level `columns` for `useDataTable`).

## Misc

- `import type` for type-only imports.
- Array syntax: follow the surrounding file (`T[]` is dominant here); don't churn.
- JSDoc only where the contract isn't obvious (see `requirePermission` in `packages/api/src/trpc.ts`).
