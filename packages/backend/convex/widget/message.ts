import type { MessageDoc } from "@convex-dev/agent";
import { type PaginationResult, paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";
import { supportAgent } from "@/ai/support";
import { escalateConversation } from "@/ai/tools/escalateConversation";
import { resolveConversation } from "@/ai/tools/resolveConversation";
import { search } from "@/ai/tools/search";
import { internal } from "../_generated/api";
import { action, query } from "../_generated/server";

export const create = action({
  args: {
    prompt: v.string(),
    threadId: v.string(),
    widgetSessionId: v.id("widgetSessions"),
  },
  handler: async (ctx, { prompt, threadId, widgetSessionId }) => {
    const widgetSession = await ctx.runQuery(internal.widgetSession.get, {
      widgetSessionId,
    });

    if (!widgetSession || widgetSession.expiresAt < Date.now()) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid session",
      });
    }

    const conversation = await ctx.runQuery(
      internal.conversation.getByThreadId,
      {
        threadId,
      }
    );

    if (!conversation) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Conversation not found!",
      });
    }

    if (conversation.status === "resolved") {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Conversation resolved",
      });
    }

    const shouldTriggerAgent = conversation.status === "unresolved";

    if (shouldTriggerAgent) {
      await supportAgent.generateText(
        ctx,
        { threadId },
        {
          prompt,
          tools: {
            search,
            resolveConversation,
            escalateConversation,
          },
        }
      );
    } else {
      await supportAgent.saveMessage(ctx, {
        threadId,
        prompt,
      });
    }
  },
});

export const getMany = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    widgetSessionId: v.id("widgetSessions"),
  },
  handler: async (ctx, { threadId, paginationOpts, widgetSessionId }) => {
    const widgetSession = await ctx.db.get(widgetSessionId);

    if (!widgetSession || widgetSession.expiresAt < Date.now()) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid session",
      });
    }

    return (await supportAgent.listMessages(ctx, {
      threadId,
      paginationOpts,
    })) as PaginationResult<MessageDoc>;
  },
});
