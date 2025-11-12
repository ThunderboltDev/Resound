"use client";

import FileView from "@/app/(dashboard)/files/view";
import { Protect } from "@/components/ui/protect";

export default function Page() {
  return (
    <Protect requiredPlan="basic">
      <FileView />
    </Protect>
  );
}
