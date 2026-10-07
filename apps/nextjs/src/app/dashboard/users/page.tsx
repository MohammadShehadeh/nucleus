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
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">Users</h1>
        <p className="text-muted-foreground text-sm">
          Manage users and their roles in the platform.
        </p>
      </div>
      <HydrateClient>
        <UsersTable />
      </HydrateClient>
    </div>
  );
}
