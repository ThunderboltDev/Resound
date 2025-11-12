"use client";

import { cn } from "@workspace/ui/lib/utils";
import { ArrowRight, ArrowUp, Check } from "lucide-react";

type ConversationStatusProps = {
  status: "unresolved" | "resolved" | "escalated";
};

const config = {
  resolved: {
    icon: Check,
    color: "bg-success",
  },
  unresolved: {
    icon: ArrowRight,
    color: "bg-warning",
  },
  escalated: {
    icon: ArrowUp,
    color: "bg-info",
  },
} as const;

export function ConversationStatus({ status }: ConversationStatusProps) {
  const { icon: Icon, color } = config[status];

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full p-1.5",
        color
      )}
    >
      <Icon className="size-3 stroke-3 text-white" />
    </div>
  );
}
