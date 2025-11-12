import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@workspace/ui/ai/conversation";
import { Message, MessageContent } from "@workspace/ui/ai/message";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { useSetAtom } from "jotai";
import { ArrowLeft, Mic, PhoneCall, PhoneMissed } from "lucide-react";
import { screenAtom } from "@/components/widget/atoms";
import WidgetHeader from "@/components/widget/header";
import { useVapi } from "@/hooks/use-vapi";

export default function WidgetVoiceScreen() {
  const setScreen = useSetAtom(screenAtom);

  const {
    isConnecting,
    isConnected,
    isSpeaking,
    transcript,
    startCall,
    endCall,
  } = useVapi();

  return (
    <>
      <WidgetHeader>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setScreen("selection")}
          >
            <ArrowLeft />
          </Button>
          <h4 className="text-lg">Voice Chat</h4>
        </div>
      </WidgetHeader>
      {transcript.length > 0 ? (
        <Conversation className="flex-1 [&>*]:overflow-y-scroll [&>*]:scrollbar-2">
          <ConversationContent>
            {transcript.map((message) => (
              <Message key={message.text + message.role} from={message.role}>
                <MessageContent role={message.role}>
                  {message.text}
                </MessageContent>
              </Message>
            ))}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <div className="flex items-center justify-center rounded-full border border-border p-3">
            <Mic className="size-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Transcript will appear here </p>
        </div>
      )}
      <div className="border-t border-border bg-secondary p-4">
        <div className="flex flex-col items-center gap-y-4">
          {isConnected && (
            <div className="flex items-center gap-x-2">
              <div
                className={cn(
                  "size-3 rounded-full animate-pulse",
                  isSpeaking ? "bg-red-500" : "bg-green-500"
                )}
              />
              <span className="text-muted-foreground text-sm">
                {isSpeaking ? "Assistant Speaking..." : "Listening..."}
              </span>
            </div>
          )}
          <div className="flex w-full justify-center">
            {isConnected ? (
              <Button
                size="lg"
                variant="danger"
                className="w-full"
                onClick={() => endCall()}
                disabled={isConnecting}
              >
                <PhoneMissed />
                End Call
              </Button>
            ) : (
              <Button
                size="lg"
                variant="success"
                className="w-full"
                onClick={() => startCall()}
                disabled={isConnecting}
              >
                <PhoneCall />
                Start Call
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
