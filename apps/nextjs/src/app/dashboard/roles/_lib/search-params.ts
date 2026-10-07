import type { RouterOutputs } from "@nucleus/api";
import { getSortingStateParser } from "@nucleus/ui/lib/parsers";
import { createSearchParamsCache, parseAsInteger, parseAsString } from "nuqs/server";

type Role = RouterOutputs["roles"]["list"]["data"][number];

// Shared by the server prefetch and the client query so both build the same query key.
export const rolesSearchParams = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<Role>().withDefault([{ id: "createdAt", desc: true }]),
  // column filters
  name: parseAsString.withDefault(""),
};

export const searchParamsCache = createSearchParamsCache(rolesSearchParams);

export type GetRolesSchema = Awaited<ReturnType<typeof searchParamsCache.parse>>;
