"use client";

import { useAtomValue } from "jotai";
import { screenAtom } from "@/components/widget/atoms";
import WidgetAuthScreen from "@/components/widget/screens/auth";
import WidgetChatScreen from "@/components/widget/screens/chat";
import WidgetContactScreen from "@/components/widget/screens/contact";
import WidgetErrorScreen from "@/components/widget/screens/error";
import WidgetInboxScreen from "@/components/widget/screens/inbox";
import WidgetLoadingScreen from "@/components/widget/screens/loading";
import WidgetSelectionScreen from "@/components/widget/screens/selection";
import WidgetVoiceScreen from "@/components/widget/screens/voice";
import type { PropsWithOrganizationId, WidgetScreen } from "@/types/widget";

export default function WidgetView({
  organizationId,
}: PropsWithOrganizationId) {
  const screen = useAtomValue<WidgetScreen>(screenAtom);

  const screenComponent = {
    loading: <WidgetLoadingScreen organizationId={organizationId} />,
    error: <WidgetErrorScreen />,
    auth: <WidgetAuthScreen />,
    selection: <WidgetSelectionScreen />,
    voice: <WidgetVoiceScreen />,
    chat: <WidgetChatScreen />,
    inbox: <WidgetInboxScreen />,
    contact: <WidgetContactScreen />,
  };

  return (
    <main className="flex h-screen w-full flex-col overflow-hidden rounded-xl border border-border bg-muted">
      {screenComponent[screen]}
    </main>
  );
}
