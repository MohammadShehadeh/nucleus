---
name: data-table-patterns
description: How Nucleus builds server-side data tables - nuqs search-param parsers shared by server and client, page.tsx prefetch + HydrateClient, a client table using useQueryStates + useQuery(trpc.x.list.queryOptions) + useDataTable (TanStack Table v9, shallow URL updates), DataTableColumnDef columns with filter meta, and a tRPC list procedure with Drizzle filters/sort/pagination. Use when creating or modifying a dashboard table, its search params, columns, row actions, or list endpoint.
---

# Data Table Patterns

Code style follows the `pxkit:pxkit-conventions` skill; this skill covers repo-specific patterns. On conflict, pxkit wins.

Reference implementation: `apps/nextjs/src/app/dashboard/users/` (also `dashboard/roles/`). Copy its shape.

## Flow

```
_lib/search-params.ts   usersSearchParams (nuqs parsers, from "nuqs/server") + searchParamsCache
page.tsx (RSC)          searchParamsCache.parse -> await prefetch(trpc.users.list.queryOptions(search)) -> <HydrateClient>
_components/users-table.tsx (client)
                        useQueryStates(usersSearchParams) -> useQuery(trpc.users.list.queryOptions(search, keepPreviousData))
                        -> useDataTable({ data, columns, pageCount }) -> <DataTable><DataTableToolbar/></DataTable>
_lib/columns.tsx        getColumns(): DataTableColumnDef<User>[] with meta { label, placeholder, variant, options }
packages/api/src/router/users.ts   list: requirePermission(...).input(...).query(...)
```

Filter/sort/page changes update the URL **shallowly** (no RSC round-trip, no full refresh); the client query key changes and TanStack Query refetches. The server prefetch only seeds the first render. Because both sides parse with the same parsers, the server and client build identical query keys and hydration hits.

## 1. `_lib/search-params.ts`

```ts
import type { RouterOutputs } from "@nucleus/api";
import { getSortingStateParser } from "@nucleus/ui/lib/parsers";
import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";

type User = RouterOutputs["users"]["list"]["data"][number];

export const usersSearchParams = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<User>().withDefault([{ id: "createdAt", desc: true }]),
  name: parseAsString.withDefault(""),
  emailVerified: parseAsArrayOf(parseAsStringEnum(["true", "false"])).withDefault([]),
};

export const searchParamsCache = createSearchParamsCache(usersSearchParams);
```

Import parsers from `"nuqs/server"` so the object is usable from both the server page and the client component. One entry per filterable column; keys must match column ids.

| `meta.variant` | Parser | Router operator |
| --- | --- | --- |
| `text` | `parseAsString.withDefault("")` | `ilike` |
| `select` / `multiSelect` | `parseAsArrayOf(parseAsStringEnum([...]))` | `eq` / `inArray` |
| `range` / `date` | `parseAsArrayOf(parseAsInteger)` | `gte` / `lte` |

## 2. `page.tsx`

Thin server page - the one place a default export is allowed.

```tsx
import type { SearchParams } from "nuqs/server";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { UsersTable } from "./_components/users-table";
import { searchParamsCache } from "./_lib/search-params";

interface UsersPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const search = searchParamsCache.parse(await searchParams);
  await prefetch(trpc.users.list.queryOptions(search));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-semibold text-2xl tracking-tight">Users</h1>
      <HydrateClient>
        <UsersTable />
      </HydrateClient>
    </div>
  );
}
```

Never pass `initialData` props; never call `api.*` (the server caller) for table data.

## 3. `_components/users-table.tsx`

```tsx
"use client";

import { DataTable } from "@nucleus/ui/components/data-table/data-table";
import { DataTableToolbar } from "@nucleus/ui/components/data-table/data-table-toolbar";
import { useDataTable } from "@nucleus/ui/hooks/use-data-table";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { useTRPC } from "@/trpc/react";
import { getColumns } from "../_lib/columns";
import { usersSearchParams } from "../_lib/search-params";

const columns = getColumns();
const EMPTY: never[] = [];

export const UsersTable = () => {
  const trpc = useTRPC();
  const [search] = useQueryStates(usersSearchParams);
  const { data } = useQuery(
    trpc.users.list.queryOptions(search, { placeholderData: keepPreviousData })
  );

  const { table } = useDataTable({
    data: data?.data ?? EMPTY,
    columns,
    pageCount: data?.pageCount ?? 0,
  });

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
};
```

- `columns` and the empty fallback are module-level so references stay stable (React Compiler is off).
- `keepPreviousData` keeps the current rows visible while the next page loads.
- Leave `shallow` at its default (`true`). `shallow: false` is the old RSC-refetch pattern - don't reintroduce it.
- Use a `prefix` option on `useDataTable` (and matching parser keys) only when two tables share a page.

## 4. `_lib/columns.tsx`

```tsx
import type { DataTableColumnDef } from "@nucleus/ui/types/data-table";

export const getColumns = (): DataTableColumnDef<User>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} label="Name" />,
    enableColumnFilter: true,
    meta: { label: "Name", variant: "text", placeholder: "Search names..." },
  },
  // select columns: meta.options = [{ label, value }]
  // dates: cell uses formatDate from @nucleus/ui/lib/format
  // actions: { id: "actions", cell: ({ row }) => <UserRowActions user={row.original} /> }
];
```

Type columns with `DataTableColumnDef<T>` (TanStack Table v9 features), not raw `ColumnDef`. `meta` shape is `DataTableColumnMeta` in `packages/ui/src/types/data-table.ts`.

## 5. Row actions and mutations

Mutations live in the row-actions component and invalidate the list (`getErrorMessage`: see `error-handling-patterns`):

```tsx
const queryClient = useQueryClient();
const setRole = useMutation(
  trpc.users.setRole.mutationOptions({
    onSuccess: () => queryClient.invalidateQueries(trpc.users.list.queryFilter()),
    onError: (error) => toast.error(getErrorMessage(error)),
  })
);
```

Gate actions with `usePermissions().can(...)` / `<Can>` from `@/components/permissions-provider` (UX only - the router enforces). Destructive/permission changes show `isPending` and wait; no optimistic UI.

## 6. List procedure

See `list` in `packages/api/src/router/{users,roles}.ts`: `requirePermission("<resource>:list|read")`, zod input `{ page, perPage (max 50), sort?, ...filters }`, `and(...)` of optional filters, `orderBy` from a whitelisted `sortableColumns` map (default `desc(createdAt)`), `Promise.all([rows, count])`, return `{ data, pageCount }`.

## Checklist

1. Table in `packages/db/src/schema/`, `pnpm db:push`.
2. Router `packages/api/src/router/<entity>.ts` with `list`; register in `packages/api/src/root.ts`; add permissions to the RBAC catalog and a `routePermissions` entry in `apps/nextjs/src/proxy.ts`.
3. `_lib/search-params.ts` parsers + cache.
4. `_lib/columns.tsx` with `meta.variant` matching the parsers.
5. `page.tsx` prefetch + `HydrateClient`.
6. `_components/<entity>-table.tsx` with `useQueryStates` + `useQuery` + `useDataTable`.
