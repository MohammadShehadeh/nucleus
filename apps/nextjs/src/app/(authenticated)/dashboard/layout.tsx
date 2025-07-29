import { SidebarInset, SidebarProvider } from "@lms/ui/components/sidebar";

import { AppSidebar } from "../components/app-sidebar";
import { SiteHeader } from "../components/site-header";

export const description = "A sidebar with a header and a search form.";

export default function Page() {
  return (
    <div
      style={
        {
          "--header-height": "4rem" as string,
        } as React.CSSProperties
      }
    >
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4">
              <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                <div className="aspect-video rounded-xl bg-muted/50" />
                <div className="aspect-video rounded-xl bg-muted/50" />
                <div className="aspect-video rounded-xl bg-muted/50" />
              </div>
              <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
