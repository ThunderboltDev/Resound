"use client";

import { api } from "@workspace/backend/_generated/api";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { LockedOverlay } from "@/components/ui/locked-overlay";

type ProtectProps = {
  requiredPlan?: "basic" | "plus" | "premium";
  children: ReactNode;
};

export function Protect({ requiredPlan = "basic", children }: ProtectProps) {
  const subscription = useQuery(api.web.subscription.get);

  if (subscription === undefined) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
      </div>
    );
  }

  const planOrder = ["basic", "plus", "premium"];
  const hasAccess =
    subscription &&
    planOrder.indexOf(subscription.planId) >= planOrder.indexOf(requiredPlan);

  if (!hasAccess) {
    return (
      <LockedOverlay requiredPlan={requiredPlan}>{children}</LockedOverlay>
    );
  }

  return <>{children}</>;
}
