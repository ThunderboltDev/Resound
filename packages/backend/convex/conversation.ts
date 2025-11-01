import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

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

    if (conversation?.widgetSessionId === widgetSessionId) {
      return conversation;
    } else {
      return null;
    }
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

    const conversationId = await ctx.db.insert("conversations", {
      threadId: "",
      widgetSessionId,
      status: "unresolved",
      organizationId: organizationId,
    });

    return conversationId;
  },
});
