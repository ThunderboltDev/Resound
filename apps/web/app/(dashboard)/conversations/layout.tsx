import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@workspace/ui/components/resizable";
import type { PropsWithChildren } from "react";
import { ConversationsPanel } from "@/app/(dashboard)/conversations/panel";

export default function ConversationLayout({ children }: PropsWithChildren) {
  return (
    <ResizablePanelGroup
      className="h-full w-full flex-1"
      direction="horizontal"
    >
      <ResizablePanel defaultSize={30} maxSize={40} minSize={20}>
        <ConversationsPanel />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel className="h-full">{children}</ResizablePanel>
    </ResizablePanelGroup>
  );
}
