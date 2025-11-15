"use client";

import { Badge } from "@workspace/ui/components/badge";
import { ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";

interface WebsiteStatusProps {
  status: "unverified" | "verified" | "failed";
}

const config = {
  unverified: {
    icon: ShieldAlert,
    label: "Unverified",
    variant: "warning",
  },
  verified: {
    icon: ShieldCheck,
    label: "Verified",
    variant: "success",
  },
  failed: {
    icon: ShieldX,
    label: "Verification Failed",
    variant: "danger",
  },
} as const;

export function WebsiteStatus({ status }: WebsiteStatusProps) {
  const Icon = config[status].icon;

  return (
    <Badge variant={config[status].variant}>
      <Icon />
      {config[status].label}
    </Badge>
  );
}
