"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";

interface WebsiteStatusProps {
  status: "unverified" | "verified" | "failed";
}

const config = {
  unverified: {
    icon: ShieldAlert,
    label: "Unverified",
    className: "text-warning",
  },
  verified: {
    icon: ShieldCheck,
    label: "Verified",
    className: "text-success",
  },
  failed: {
    icon: ShieldX,
    label: "Verification Failed",
    className: "text-danger",
  },
} as const;

export function WebsiteStatus({ status }: WebsiteStatusProps) {
  const Icon = config[status].icon;

  return (
    <Tooltip>
      <TooltipTrigger className={`flex mx-auto ${config[status].className}`}>
        <Icon className="size-5.5" />
      </TooltipTrigger>
      <TooltipContent>{config[status].label}</TooltipContent>
    </Tooltip>
  );
}
