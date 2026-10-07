"use client";

import { Button } from "@nucleus/ui/components/button";
import { DataTable } from "@nucleus/ui/components/data-table/data-table";
import { DataTableToolbar } from "@nucleus/ui/components/data-table/data-table-toolbar";
import { useDataTable } from "@nucleus/ui/hooks/use-data-table";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useQueryStates } from "nuqs";
import { useState } from "react";
import { usePermissions } from "@/components/permissions-provider";
import { useTRPC } from "@/trpc/react";
import { getColumns } from "../_lib/columns";
import { rolesSearchParams } from "../_lib/search-params";
import { RoleFormDialog } from "./role-form-dialog";

const columns = getColumns();
const EMPTY: never[] = [];

export const RolesTable = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { can } = usePermissions();
  const [createOpen, setCreateOpen] = useState(false);
  const [search] = useQueryStates(rolesSearchParams);

  // Hydrated from the server prefetch on first render; later URL changes refetch on the client.
  const { data } = useQuery(
    trpc.roles.list.queryOptions(search, { placeholderData: keepPreviousData })
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
      <DataTableToolbar table={table}>
        {can("role:create") && (
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            New role
          </Button>
        )}
      </DataTableToolbar>
      <RoleFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSaved={() => queryClient.invalidateQueries(trpc.roles.list.queryFilter())}
      />
    </DataTable>
  );
};
