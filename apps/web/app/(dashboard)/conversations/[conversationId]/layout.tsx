"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@workspace/ui/components/resizable";
import type { PropsWithChildren } from "react";
import { ContactPanel } from "./contact-panel";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <ResizablePanelGroup className="h-full flex-1" direction="horizontal">
      <ResizablePanel className="h-full" defaultSize={60}>
        <div className="h-full flex flex-1 flex-col">{children}</div>
      </ResizablePanel>
      <ResizableHandle className="block" />
      <ResizablePanel className="h-full" defaultSize={40} maxSize={100}>
        <ContactPanel />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
