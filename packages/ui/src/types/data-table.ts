import type { DataTableFeatures } from "@nucleus/ui/lib/data-table";
import type { FilterVariant } from "@nucleus/validators/data-table";
import type { ColumnDef, Row, RowData } from "@tanstack/react-table";
import type * as React from "react";

// UI-specific types (depend on React / TanStack)

export interface DataTableColumnMeta {
  label?: string;
  placeholder?: string;
  variant?: FilterVariant;
  options?: Option[];
  range?: [number, number];
  unit?: string;
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
}

export type DataTableColumnDef<TData extends RowData> = ColumnDef<DataTableFeatures, TData>;

export interface Option {
  label: string;
  value: string;
  count?: number;
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
}

export interface DataTableRowAction<TData extends RowData> {
  row: Row<DataTableFeatures, TData>;
  variant: "update" | "delete";
}
