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

  // Hydrated from the server prefetch on first render; later URL changes refetch on the client.
  const { data } = useQuery(
    trpc.users.list.queryOptions(search, { placeholderData: keepPreviousData })
  );

  const { table } = useDataTable({
    data: data?.data ?? EMPTY,
    columns,
    pageCount: data?.pageCount ?? 0,
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 },
    },
  });

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
};
