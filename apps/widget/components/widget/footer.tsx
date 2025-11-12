"use client";

import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { useAtomValue, useSetAtom } from "jotai";
import { Home, Inbox } from "lucide-react";
import { screenAtom } from "@/components/widget/atoms";

export default function WidgetFooter() {
  const screen = useAtomValue(screenAtom);
  const setScreen = useSetAtom(screenAtom);

  return (
    <footer className="flex items-center justify-between border-t border-border bg-background">
      <Button
        className="h-14 flex-1 rounded-none"
        size="icon"
        variant="ghost"
        onClick={() => setScreen("selection")}
      >
        <Home className={cn(screen === "selection" && "text-primary")} />
      </Button>
      <Button
        className="h-14 flex-1 rounded-none"
        size="icon"
        variant="ghost"
        onClick={() => setScreen("inbox")}
      >
        <Inbox className={cn(screen === "inbox" && "text-primary")} />
      </Button>
    </footer>
  );
}
