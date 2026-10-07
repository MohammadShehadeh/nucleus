"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@nucleus/ui/components/breadcrumb";
import { Button } from "@nucleus/ui/components/button";
import { Separator } from "@nucleus/ui/components/separator";
import { useSidebar } from "@nucleus/ui/components/sidebar";
import { SidebarIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainMenu } from "./app-sidebar";
import { SearchForm } from "./search-form";

const getTitleByPathname = (pathname: string) => {
  const menu = mainMenu.find((i) => i.url === pathname);
  return menu?.title;
};

export const SiteHeader = () => {
  const { toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const title = getTitleByPathname(pathname);

  return (
    <header className="sticky top-0 z-50 flex w-full items-center border-b bg-background">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
        <Button
          className="size-8"
          variant="ghost"
          size="icon"
          aria-label="Toggle sidebar"
          onClick={toggleSidebar}
        >
          <SidebarIcon />
        </Button>
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {title && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{title}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
        <SearchForm className="w-full sm:ml-auto sm:w-auto" />
      </div>
    </header>
  );
};
