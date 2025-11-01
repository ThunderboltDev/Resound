"use client";

import { SidebarProvider } from "@workspace/ui/components/sidebar";
import type { PropsWithChildren } from "react";
import DashboardSidebar from "@/app/(dashboard)/sidebar";
import { withAuth } from "@/hoc/with-auth";
import { type PropsWithOrganization, withOrganization } from "@/hoc/with-org";

type DashboardLayoutProps = {
  defaultOpen: boolean;
};

function DashboardLayout({
  children,
  organizations,
  selectedOrganization,
}: PropsWithOrganization<PropsWithChildren<DashboardLayoutProps>>) {
  return (
    <SidebarProvider>
      <DashboardSidebar
        organizations={organizations}
        selectedOrganization={selectedOrganization}
      />
      <main>{children}</main>
    </SidebarProvider>
  );
}

export default withAuth(withOrganization(DashboardLayout));
