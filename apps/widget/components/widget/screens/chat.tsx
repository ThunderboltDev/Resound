import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import { useQuery } from "convex/react";
import { useAtomValue, useSetAtom } from "jotai";
import { ArrowLeft, Menu } from "lucide-react";
import {
  conversationIdAtom,
  organizationIdAtom,
  screenAtom,
  widgetSessionIdAtomFamily,
} from "@/components/widget/atoms";
import WidgetHeader from "@/components/widget/header";

export default function WidgetChatScreen() {
  const setScreen = useSetAtom(screenAtom);
  const setConversationId = useSetAtom(conversationIdAtom);

  const conversationId = useAtomValue(conversationIdAtom);
  const organizationId = useAtomValue(organizationIdAtom);

  const widgetSessionId = useAtomValue(
    widgetSessionIdAtomFamily(organizationId as string)
  );

  const conversation = useQuery(
    api.conversation.get,
    conversationId && widgetSessionId
      ? {
          conversationId,
          widgetSessionId,
        }
      : "skip"
  );

  const onBack = () => {
    setConversationId(null);
    setScreen("selection");
  };

  return (
    <>
      <WidgetHeader className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft />
          </Button>
          <p className="text-lg">Chat</p>
        </div>
        <Button size="icon" variant="ghost">
          <Menu />
        </Button>
      </WidgetHeader>
      <div className="flex flex-col items-center justify-center gap-4 h-full">
        Chat
        <Button variant="ghost" size="icon">
          <ArrowLeft />
        </Button>
        {JSON.stringify(conversation)}
      </div>
    </>
  );
}
