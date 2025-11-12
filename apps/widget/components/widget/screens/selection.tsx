import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import { useMutation } from "convex/react";
import { useAtomValue, useSetAtom } from "jotai";
import { ChevronRight, MessageCircleMore, Mic, Phone } from "lucide-react";
import { useState } from "react";
import {
  conversationIdAtom,
  errorMessageAtom,
  hasVapiSecretsAtom,
  organizationIdAtom,
  screenAtom,
  widgetSessionIdAtomFamily,
  widgetSettingsAtom,
} from "@/components/widget/atoms";
import WidgetFooter from "@/components/widget/footer";
import WidgetHeader from "@/components/widget/header";

export default function WidgetSelectionScreen() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const setScreen = useSetAtom(screenAtom);
  const setErrorMessage = useSetAtom(errorMessageAtom);
  const setConversationId = useSetAtom(conversationIdAtom);

  const widgetSettings = useAtomValue(widgetSettingsAtom);
  const hasVapiSecrets = useAtomValue(hasVapiSecretsAtom);
  const organizationId = useAtomValue(organizationIdAtom);
  const widgetSessionId = useAtomValue(
    widgetSessionIdAtomFamily(organizationId ?? "")
  );

  const createConversation = useMutation(api.conversation.create);

  const handleNewConversation = async () => {
    setIsLoading(true);

    if (!organizationId) {
      setErrorMessage("Organization ID not found!");
      setScreen("error");
      return;
    }

    if (!widgetSessionId) {
      setScreen("auth");
      return;
    }

    try {
      const conversationId = await createConversation({
        widgetSessionId,
        organizationId,
      });

      setConversationId(conversationId);
      setScreen("chat");
    } catch {
      setScreen("auth");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <WidgetHeader>
        <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
          <p className="text-3xl">Hi there! 👋</p>
          <p className="text-lg">Let&apos;s get you started!</p>
        </div>
      </WidgetHeader>
      <div className="flex flex-1 flex-col gap-4 p-4 h-full overflow-y-auto">
        <Button
          className="h-16 justify-between"
          onClick={handleNewConversation}
          disabled={isLoading}
        >
          <div className="flex items-center gap-2">
            <MessageCircleMore />
            <span>Start chat</span>
          </div>
          <ChevronRight />
        </Button>
        {hasVapiSecrets && widgetSettings?.vapiSettings?.assistantId && (
          <Button
            className="h-16 justify-between"
            onClick={() => setScreen("voice")}
            disabled={isLoading}
          >
            <div className="flex items-center gap-2">
              <Mic />
              <span>Start voice call</span>
            </div>
            <ChevronRight />
          </Button>
        )}
        {hasVapiSecrets && widgetSettings?.vapiSettings?.phoneNumber && (
          <Button
            className="h-16 justify-between"
            onClick={() => setScreen("contact")}
            disabled={isLoading}
          >
            <div className="flex items-center gap-2">
              <Phone />
              <span>Call us</span>
            </div>
            <ChevronRight />
          </Button>
        )}
      </div>
      <WidgetFooter />
    </>
  );
}
