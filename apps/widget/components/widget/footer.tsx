"use client";

import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { Home, Inbox } from "lucide-react";

export default function WidgetFooter() {
  const screen: string = "selection";

  return (
    <footer className="flex items-center justify-between border-t border-border bg-background">
      <Button
        className="h-14 flex-1 rounded-none"
        size="icon"
        variant="ghost"
        onClick={() => {}}
      >
        <Home className={cn(screen === "selection" && "text-primary")} />
      </Button>
      <Button
        className="h-14 flex-1 rounded-none"
        size="icon"
        variant="ghost"
        onClick={() => {}}
      >
        <Inbox className={cn(screen === "inbox" && "text-primary")} />
      </Button>
    </footer>
  );
}
