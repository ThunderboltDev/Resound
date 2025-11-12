import { saveMessage } from "@convex-dev/agent";
import { paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";
import { supportAgent } from "@/ai/support";
import { components } from "../_generated/api";
import { mutation, query } from "../_generated/server";

export const get = query({
  args: {
    conversationId: v.id("conversations"),
    widgetSessionId: v.id("widgetSessions"),
  },
  handler: async (ctx, { conversationId, widgetSessionId }) => {
    const widgetSession = await ctx.db.get(widgetSessionId);

    if (!widgetSession || widgetSession.expiresAt < Date.now()) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid session",
      });
    }

    const conversation = await ctx.db.get(conversationId);

    if (!conversation) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Conversation not found!",
      });
    }

    if (conversation?.widgetSessionId !== widgetSessionId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Incorrect session",
      });
    }

    return conversation;
  },
});

export const create = mutation({
  args: {
    organizationId: v.id("organizations"),
    widgetSessionId: v.id("widgetSessions"),
  },
  handler: async (ctx, { organizationId, widgetSessionId }) => {
    const widgetSession = await ctx.db.get(widgetSessionId);

    if (!widgetSession || widgetSession.expiresAt < Date.now()) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid session",
      });
    }

    const widgetSettings = await ctx.db
      .query("widgetSettings")
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", organizationId)
      )
      .unique();

    const { threadId } = await supportAgent.createThread(ctx, {
      userId: organizationId,
    });

    await saveMessage(ctx, components.agent, {
      threadId,
      message: {
        role: "assistant",
        content: widgetSettings?.greetingMessage ?? "",
      },
    });

    const conversationId = await ctx.db.insert("conversations", {
      threadId,
      widgetSessionId,
      status: "unresolved",
      organizationId: organizationId,
    });

    return conversationId;
  },
});

export const getMany = query({
  args: {
    widgetSessionId: v.id("widgetSessions"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { widgetSessionId, paginationOpts }) => {
    const widgetSession = await ctx.db.get(widgetSessionId);

    if (!widgetSession || widgetSession.expiresAt < Date.now()) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid session",
      });
    }

    const conversations = await ctx.db
      .query("conversations")
      .withIndex("widgetSessionId", (q) =>
        q.eq("widgetSessionId", widgetSessionId)
      )
      .order("desc")
      .paginate(paginationOpts);

    const conversationsWithLastMessage = await Promise.all(
      conversations.page.map(async (conversation) => {
        const messages = await supportAgent.listMessages(ctx, {
          threadId: conversation.threadId,
          paginationOpts: { numItems: 1, cursor: null },
        });

        return {
          ...conversation,
          lastMessage: messages.page[0],
        };
      })
    );

    return {
      ...conversations,
      page: conversationsWithLastMessage,
    };
  },
});
