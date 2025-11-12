import { ConvexError, v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import { query } from "../_generated/server";

export const getByConversationId = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, { conversationId }) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_id", (q) => q.eq("_id", identity.subject as Id<"users">))
      .unique();

    if (!user) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "User not found",
      });
    }

    const organizationId = user.currentOrganizationId;

    if (!organizationId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "organization id not found",
      });
    }

    const conversation = await ctx.db.get(conversationId);

    if (!conversation || conversation.organizationId !== organizationId) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Conversation not found",
      });
    }

    return await ctx.db.get(conversation.widgetSessionId);
  },
});
