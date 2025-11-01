import { cookies } from "next/headers";
import type { PropsWithChildren } from "react";
import DashboardLayout from "@/components/layouts/dashboard";

export default async function DashboardLayoutPage({
  children,
}: PropsWithChildren) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <DashboardLayout defaultOpen={defaultOpen}>{children}</DashboardLayout>
  );
}
