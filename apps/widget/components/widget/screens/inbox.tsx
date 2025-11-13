import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import { ConversationStatus } from "@workspace/ui/components/conversation-status";
import { InfiniteScrollRef } from "@workspace/ui/components/infinite-scroll-ref";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { usePaginatedQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { useSetAtom } from "jotai";
import { ArrowLeft } from "lucide-react";
import { conversationIdAtom, screenAtom } from "@/components/widget/atoms";
import WidgetFooter from "@/components/widget/footer";
import WidgetHeader from "@/components/widget/header";

export default function WidgetInboxScreen() {
  const setScreen = useSetAtom(screenAtom);
  const setConversationId = useSetAtom(conversationIdAtom);

  const conversations = usePaginatedQuery(
    api.web.conversation.getMany,
    {},
    { initialNumItems: 10 }
  );

  const { infiniteScrollRef, isExhausted } = useInfiniteScroll({
    status: conversations.status,
    loadMore: conversations.loadMore,
    loadSize: 10,
  });

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
          <h4 className="text-lg">Inbox</h4>
        </div>
      </WidgetHeader>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 overflow-y-auto pt-128">
        {conversations.results.length > 0 &&
          conversations.results.map((conversation) => (
            <Button
              key={conversation._id}
              className="h-20 w-full justify-between"
              onClick={() => {
                setConversationId(conversation._id);
                setScreen("chat");
              }}
            >
              <div className="flex w-full flex-col gap-4 overflow-hidden">
                <div className="flex w-full items-center justify-between gap-x-2">
                  <p className="text-muted-foreground text-sm">Chat</p>
                  <p className="text-muted-foreground text-sm">
                    {formatDistanceToNow(new Date(conversation._creationTime))}
                  </p>
                </div>
                <div className="flex w-full items-center justify-between gap-2">
                  <p className="truncate text-sm">
                    {conversation.lastMessage?.text}
                  </p>
                  <ConversationStatus status={conversation.status} />
                </div>
              </div>
            </Button>
          ))}
        <InfiniteScrollRef
          isExhausted={isExhausted}
          exhaustedText="No more items"
          ref={infiniteScrollRef}
        />
      </div>
      <WidgetFooter />
    </>
  );
}
