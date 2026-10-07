import type { SearchParams } from "nuqs/server";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { RolesTable } from "./_components/roles-table";
import { searchParamsCache } from "./_lib/search-params";

interface RolesPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function RolesPage({ searchParams }: RolesPageProps) {
  const search = searchParamsCache.parse(await searchParams);

  await prefetch(trpc.roles.list.queryOptions(search));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">Roles</h1>
        <p className="text-muted-foreground text-sm">
          Create roles and control what each one can access across the platform.
        </p>
      </div>
      <HydrateClient>
        <RolesTable />
      </HydrateClient>
    </div>
  );
}
