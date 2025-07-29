import { SidebarInset, SidebarProvider } from "@lms/ui/components/sidebar";

import { AppSidebar } from "../components/app-sidebar";
import { SiteHeader } from "../components/site-header";

export const description = "A sidebar with a header and a search form.";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
