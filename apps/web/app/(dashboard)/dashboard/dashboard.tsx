"use client";

import { SidebarTrigger } from "@workspace/ui/components/sidebar";

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-2 items-center">
      <h2>Dashboard</h2>
      <SidebarTrigger />
    </div>
  );
}
