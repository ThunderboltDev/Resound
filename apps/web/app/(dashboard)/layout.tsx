"use client";

import { SidebarProvider } from "@workspace/ui/components/sidebar";
import { Provider } from "jotai";
import type { PropsWithChildren } from "react";
import DashboardSidebar from "@/app/(dashboard)/sidebar";
import { withAuth } from "@/hoc/with-auth";
import { withOrganization } from "@/hoc/with-org";

function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <Provider>
        <main className="w-full">{children}</main>
      </Provider>
    </SidebarProvider>
  );
}

export default withAuth(withOrganization(DashboardLayout));
