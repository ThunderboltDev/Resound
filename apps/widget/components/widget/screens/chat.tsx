import { toUIMessages, useThreadMessages } from "@convex-dev/agent/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@workspace/backend/_generated/api";
import {
  Conversation,
  ConversationContent,
} from "@workspace/ui/ai/conversation";
import { Message, MessageContent } from "@workspace/ui/ai/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@workspace/ui/ai/prompt-input";
import { Response } from "@workspace/ui/ai/response";
import { Suggestion, Suggestions } from "@workspace/ui/ai/suggestion";
import { Button } from "@workspace/ui/components/button";
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar";
import { Form, FormField } from "@workspace/ui/components/form";
import { InfiniteScrollRef } from "@workspace/ui/components/infinite-scroll-ref";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { useAction, useQuery } from "convex/react";
import { useAtomValue, useSetAtom } from "jotai";
import { ArrowLeft, Menu } from "lucide-react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  conversationIdAtom,
  organizationIdAtom,
  screenAtom,
  widgetSessionIdAtomFamily,
  widgetSettingsAtom,
} from "@/components/widget/atoms";
import WidgetHeader from "@/components/widget/header";

const formSchema = z.object({
  message: z.string().min(1, "Message is required!"),
});

export default function WidgetChatScreen() {
  const setScreen = useSetAtom(screenAtom);
  const setConversationId = useSetAtom(conversationIdAtom);

  const conversationId = useAtomValue(conversationIdAtom);
  const organizationId = useAtomValue(organizationIdAtom);
  const widgetSettings = useAtomValue(widgetSettingsAtom);

  const widgetSessionId = useAtomValue(
    widgetSessionIdAtomFamily(organizationId as string)
  );

  const suggestions = useMemo(() => {
    if (!widgetSettings?.defaultSuggestions) {
      return [];
    }

    return widgetSettings.defaultSuggestions
      .filter((suggestion) => suggestion.trim() !== "")
      .map((suggestion, index) => ({
        id: `suggestion-${index}`,
        text: suggestion,
      }));
  }, [widgetSettings]);

  const conversation = useQuery(
    api.widget.conversation.get,
    conversationId && widgetSessionId
      ? {
          widgetSessionId,
          conversationId,
        }
      : "skip"
  );

  const messages = useThreadMessages(
    api.widget.message.getMany,
    conversation?.threadId && widgetSessionId
      ? {
          threadId: conversation.threadId,
          widgetSessionId,
        }
      : "skip",
    {
      initialNumItems: 10,
    }
  );

  const { infiniteScrollRef, isExhausted } = useInfiniteScroll({
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

  const createMessage = useAction(api.widget.message.create);

  const onBack = () => {
    setConversationId(null);
    setScreen("selection");
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!conversation || !widgetSessionId) {
      return;
    }

    form.reset();

    await createMessage({
      prompt: values.message,
      threadId: conversation.threadId,
      widgetSessionId,
    });
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
      <Conversation className="[&>*]:scrollbar-2 [&>*]:overflow-y-scroll">
        <ConversationContent>
          <InfiniteScrollRef
            isExhausted={isExhausted}
            ref={infiniteScrollRef}
          />
          {toUIMessages(
            messages.results.filter((message) => !!message.text)
          ).map((message) => {
            return (
              <Message
                key={message.id}
                from={message.role === "user" ? "user" : "assistant"}
              >
                <MessageContent>
                  <Response origin="">{message.text}</Response>
                </MessageContent>
                {message.role !== "user" && (
                  <DicebearAvatar
                    seed="assistant"
                    imageUrl="/logo.webp"
                    className="invert"
                  />
                )}
              </Message>
            );
          })}
        </ConversationContent>
      </Conversation>
      {suggestions.length > 0 &&
        toUIMessages(messages.results.filter((message) => !!message.text))
          ?.length <= 1 && (
          <Suggestions className="flex w-full flex-col items-end p-2">
            {suggestions.map((suggestion) => (
              <Suggestion
                key={suggestion.id}
                suggestion={suggestion.text}
                onClick={() => {
                  form.setValue("message", suggestion.text);
                  form.handleSubmit(onSubmit)();
                }}
              />
            ))}
          </Suggestions>
        )}
      <Form {...form}>
        <PromptInput
          className="rounded-none border-x-0 border-b-0"
          onSubmit={() => {
            form.handleSubmit(onSubmit)();
          }}
        >
          <FormField
            name="message"
            control={form.control}
            disabled={conversation?.status === "resolved"}
            render={({ field }) => (
              <PromptInputTextarea
                {...field}
                disabled={
                  conversation?.status === "resolved" ||
                  form.formState.isSubmitting
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
            <PromptInputTools />
            <PromptInputSubmit
              type="submit"
              status="ready"
              disabled={
                conversation?.status === "resolved" || !form.formState.isValid
              }
            />
          </PromptInputFooter>
        </PromptInput>
      </Form>
    </>
  );
}
