"use no memo";
"use client";

import { Button } from "@nucleus/ui/components/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@nucleus/ui/components/command";
import { Popover, PopoverContent, PopoverTrigger } from "@nucleus/ui/components/popover";
import type { DataTableFeatures } from "@nucleus/ui/lib/data-table";
import { useDataTableLabels } from "@nucleus/ui/lib/data-table-labels";
import { cn } from "@nucleus/ui/lib/utils";
import type { ReactTable, RowData } from "@tanstack/react-table";
import { Check, Settings2 } from "lucide-react";
import * as React from "react";

interface DataTableViewOptionsProps<TData extends RowData>
  extends React.ComponentProps<typeof PopoverContent> {
  table: ReactTable<DataTableFeatures, TData>;
  disabled?: boolean;
}

export const DataTableViewOptions = <TData extends RowData>({
  table,
  disabled,
  ...props
}: DataTableViewOptionsProps<TData>) => {
  const labels = useDataTableLabels();
  const columns = React.useMemo(
    () =>
      table
        .getAllColumns()
        .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide()),
    [table]
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          aria-label={labels.toggleColumns}
          role="combobox"
          variant="outline"
          size="sm"
          data-slot="data-table-view-options"
          className="ms-auto hidden h-8 font-normal lg:flex"
          disabled={disabled}
        >
          <Settings2 className="text-muted-foreground" />
          {labels.view}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-44 p-0" {...props}>
        <Command>
          <CommandInput placeholder={labels.searchColumns} />
          <CommandList>
            <CommandEmpty>{labels.noColumns}</CommandEmpty>
            <CommandGroup>
              {columns.map((column) => (
                <CommandItem
                  key={column.id}
                  onSelect={() => column.toggleVisibility(!column.getIsVisible())}
                >
                  <span className="truncate">{column.columnDef.meta?.label ?? column.id}</span>
                  <Check
                    className={cn(
                      "ms-auto size-4 shrink-0",
                      column.getIsVisible() ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
