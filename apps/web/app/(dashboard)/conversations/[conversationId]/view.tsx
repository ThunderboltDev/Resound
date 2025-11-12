"use client";

import { toUIMessages, useThreadMessages } from "@convex-dev/agent/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@workspace/backend/_generated/api";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@workspace/ui/ai/conversation";
import { Message, MessageContent } from "@workspace/ui/ai/message";
import {
  PromptInput,
  PromptInputButton,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@workspace/ui/ai/prompt-input";
import { Response } from "@workspace/ui/ai/response";
import { Button } from "@workspace/ui/components/button";
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar";
import { Form, FormField } from "@workspace/ui/components/form";
import { InfiniteScroll } from "@workspace/ui/components/infinite-scroll";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { useAction, useMutation, useQuery } from "convex/react";
import { MoreHorizontal, Wand2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import ConversationStatusButton from "@/app/(dashboard)/conversations/[conversationId]/status-button";

const formSchema = z.object({
  message: z.string().min(1, "Message is required!"),
});

type ConversationsViewProps = {
  conversationId: string;
};

export default function ConversationsView({
  conversationId,
}: ConversationsViewProps) {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);

  const conversation = useQuery(api.private.conversation.getOne, {
    conversationId,
  });

  const messages = useThreadMessages(
    api.private.messages.getMany,
    conversation?.threadId
      ? {
          threadId: conversation.threadId,
        }
      : "skip",
    {
      initialNumItems: 10,
    }
  );

  const {
    topElementRef,
    handleLoadMore,
    canLoadMore,
    isLoadingMore,
    isLoadingFirstPage,
  } = useInfiniteScroll({
    status: messages.status,
    loadMore: messages.loadMore,
    loadSize: 10,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  const enhanceResponse = useAction(api.private.messages.enhanceResponse);
  const createMessage = useMutation(api.private.messages.create);
  const updateConversationStatus = useMutation(
    api.private.conversation.updateStatus
  );

  const handleEnhanceResponse = async () => {
    setIsEnhancing(true);

    try {
      const response = await enhanceResponse({
        response: form.getValues("message"),
      });

      form.setValue("message", response);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while enhancing response.");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!conversation) {
      return;
    }

    setIsUpdatingStatus(true);
    let newStatus: string;

    if (conversation.status === "unresolved") {
      newStatus = "escalated";
    } else if (conversation.status === "escalated") {
      newStatus = "resolved";
    } else {
      newStatus = "unresolved";
    }

    try {
      await updateConversationStatus({
        conversationId,
        status: newStatus,
      });
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!conversation) {
      return;
    }

    form.reset();

    try {
      await createMessage({
        conversationId,
        message: values.message,
      });
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    }
  };

  if (!conversation || isLoadingFirstPage) {
    return <ChatLoading />;
  }

  return (
    <div className="flex h-full flex-col bg-muted">
      <header className="flex items-center justify-between border-b border-border bg-background p-2">
        <Button size="icon" variant="ghost">
          <MoreHorizontal />
        </Button>
        <ConversationStatusButton
          disabled={isUpdatingStatus}
          status={conversation?.status}
          onClick={() => handleToggleStatus()}
        />
      </header>
      <Conversation className="max-h-[calc(100vh-180px)]">
        <ConversationContent>
          <InfiniteScroll
            canLoadMore={canLoadMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={handleLoadMore}
            ref={topElementRef}
          />
          {toUIMessages(
            messages.results.filter((message) => !!message.text)
          ).map((message) => {
            return (
              <Message
                key={message.id}
                from={message.role === "user" ? "assistant" : "user"}
              >
                <MessageContent>
                  <Response>{message.text}</Response>
                </MessageContent>
                {message.role === "user" && (
                  <DicebearAvatar seed={conversation?._id} />
                )}
              </Message>
            );
          })}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <div className="p-2">
        <Form {...form}>
          <PromptInput
            onSubmit={() => {
              form.handleSubmit(onSubmit)();
            }}
          >
            <FormField
              name="message"
              control={form.control}
              disabled={conversation?.status === "resvoled"}
              render={({ field }) => (
                <PromptInputTextarea
                  {...field}
                  disabled={
                    conversation?.status === "resvoled" ||
                    form.formState.isSubmitting ||
                    isEnhancing
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      form.handleSubmit(onSubmit)();
                    }
                  }}
                  placeholder={
                    conversation?.status === "resolved"
                      ? "This conversation has been resolved."
                      : "Enter a message..."
                  }
                />
              )}
            />
            <PromptInputFooter>
              <PromptInputTools>
                <PromptInputButton
                  onClick={handleEnhanceResponse}
                  disabled={
                    conversation?.status === "resolved" ||
                    isEnhancing ||
                    !form.formState.isValid
                  }
                  aria-busy={isEnhancing}
                >
                  <Wand2 /> {isEnhancing ? "Enhancing..." : "Enhance"}
                </PromptInputButton>
              </PromptInputTools>
              <PromptInputSubmit
                type="submit"
                status="ready"
                disabled={
                  conversation?.status === "resolved" ||
                  form.formState.isSubmitting ||
                  !form.formState.isValid ||
                  isEnhancing
                }
              />
            </PromptInputFooter>
          </PromptInput>
        </Form>
      </div>
    </div>
  );
}

function ChatLoading() {
  return (
    <div className="flex h-full flex-col bg-muted">
      <header className="flex items-center justify-between border-b border-border bg-background p-2">
        <Button size="icon" variant="ghost">
          <MoreHorizontal />
        </Button>
        {/* <ConversationStatusButton
          disabled={isUpdatingStatus}
          status={conversation?.status}
          onClick={() => handleToggleStatus()}
        /> */}
      </header>
      <Conversation className="max-h-[calc(100vh-180px)]">
        <ConversationContent>
          {Array.from({ length: 8 }).map((_, index) => {
            const isUser = index % 2 === 0;
            return (
              <Message
                key={crypto.randomUUID()}
                from={isUser ? "assistant" : "user"}
              >
                <MessageContent>
                  <Skeleton className="w-40" />
                </MessageContent>
                {isUser && <Skeleton className="size-8 rounded-full" />}
              </Message>
            );
          })}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <div className="p-2">
        <PromptInput onSubmit={() => {}} aria-disabled="true">
          <PromptInputTextarea
            disabled={true}
            placeholder={"Enter a message..."}
          />
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputButton disabled={true}>
                <Wand2 />
                Enhance
              </PromptInputButton>
            </PromptInputTools>
            <PromptInputSubmit type="submit" status="ready" disabled={true} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
