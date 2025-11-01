"use client";

import { cn } from "@workspace/ui/lib/utils";
import type { PropsWithChildren } from "react";

type WidgetHeaderProps = {
  className?: string;
};

export default function WidgetHeader({
  className = "",
  children,
}: PropsWithChildren<WidgetHeaderProps>) {
  return (
    <header className={cn("p-3 bg-primary text-primary-foreground", className)}>
      {children}
    </header>
  );
}
