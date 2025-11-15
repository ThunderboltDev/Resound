"use client";

import FileView from "@/app/(dashboard)/knowledge-base/view";
import { Protect } from "@/components/ui/protect";

export default function Page() {
  return (
    <Protect requiredPlan="basic">
      <FileView />
    </Protect>
  );
}
