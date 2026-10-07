"use client";

import type { PermissionKey } from "@nucleus/db/rbac/permissions";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@nucleus/ui/components/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@nucleus/ui/components/sidebar";
import {
  ChevronRight,
  Command,
  HardDrive,
  LifeBuoy,
  type LucideIcon,
  Send,
  ShieldUser,
  User,
} from "lucide-react";
import Link from "next/link";
import type * as React from "react";
import { NavUser, type SidebarUser } from "./nav-user";
import { Can } from "./permissions-provider";

interface SidebarSubNavItem {
  title: string;
  url: string;
}

interface SidebarNavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
  permissions?: PermissionKey[];
  subNav?: SidebarSubNavItem[];
}

export const mainMenu: SidebarNavItem[] = [
  {
    title: "Media Library",
    url: "/dashboard/media-library",
    icon: HardDrive,
    isActive: false,
  },
  {
    title: "Manage Users",
    url: "/dashboard/users",
    icon: User,
    permissions: ["user:list"],
  },
  {
    title: "Manage Roles",
    url: "/dashboard/roles",
    icon: ShieldUser,
    permissions: ["role:read"],
  },
];

const navSecondary = [
  { title: "Support", url: "#", icon: LifeBuoy },
  { title: "Feedback", url: "#", icon: Send },
];

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: SidebarUser;
}

export const AppSidebar = ({ user, ...props }: AppSidebarProps) => {
  return (
    <Sidebar
      className="h-[calc(100svh-var(--header-height))]! top-[var(--header-height)]"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Command className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Nucleus</span>
                <span className="truncate text-xs">Platform</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarMenu>
            {mainMenu.map((mainMenu) => (
              <Can anyOf={mainMenu.permissions} key={mainMenu.url}>
                <Collapsible
                  key={mainMenu.title}
                  defaultOpen={mainMenu.isActive}
                  render={<SidebarMenuItem />}
                >
                  <SidebarMenuButton tooltip={mainMenu.title} render={<Link href={mainMenu.url} />}>
                    <mainMenu.icon />
                    <span>{mainMenu.title}</span>
                  </SidebarMenuButton>
                  {mainMenu.subNav?.length ? (
                    <>
                      <CollapsibleTrigger
                        render={<SidebarMenuAction className="data-panel-open:rotate-90" />}
                      >
                        <ChevronRight />
                        <span className="sr-only">Toggle</span>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {mainMenu.subNav.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton render={<Link href={subItem.url} />}>
                                <span>{subItem.title}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </>
                  ) : null}
                </Collapsible>
              </Can>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navSecondary.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton size="sm" render={<Link href={item.url} />}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
};
