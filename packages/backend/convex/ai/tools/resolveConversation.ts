import { createTool } from "@convex-dev/agent";
import { z } from "zod";
import { supportAgent } from "@/ai/support";
import { internal } from "../../_generated/api";

export const resolveConversation = createTool({
  description: "Resolve a conversation",
  args: z.object({}),
  handler: async (ctx) => {
    if (!ctx.threadId) {
      return "Missing thread ID";
    }

    await ctx.runMutation(internal.conversation.resolve, {
      threadId: ctx.threadId,
    });

    await supportAgent.saveMessage(ctx, {
      threadId: ctx.threadId,
      message: {
        role: "assistant",
        content: "Conversation resolved!",
      },
    });

    return "Conversation resolved!";
  },
});
