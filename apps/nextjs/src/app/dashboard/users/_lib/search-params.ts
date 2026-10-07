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

// Shared by the server prefetch and the client query so both build the same query key.
export const usersSearchParams = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<User>().withDefault([{ id: "createdAt", desc: true }]),
  // column filters
  name: parseAsString.withDefault(""),
  email: parseAsString.withDefault(""),
  emailVerified: parseAsArrayOf(parseAsStringEnum(["true", "false"])).withDefault([]),
};

export const searchParamsCache = createSearchParamsCache(usersSearchParams);

export type GetUsersSchema = Awaited<ReturnType<typeof searchParamsCache.parse>>;
