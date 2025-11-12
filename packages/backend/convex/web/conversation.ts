import { type PaginationResult, paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";
import { supportAgent } from "@/ai/support";
import type { Doc, Id } from "../_generated/dataModel";
import { mutation, query } from "../_generated/server";

export const get = query({
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

    if (!conversation) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Conversation not found!",
      });
    }

    if (conversation.organizationId !== user.currentOrganizationId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid organization id",
      });
    }

    const widgetSession = await ctx.db.get(conversation.widgetSessionId);

    if (!widgetSession) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "widget session not found!",
      });
    }

    return { ...conversation, widgetSession };
  },
});

export const getMany = query({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(
      v.union(
        v.literal("unresolved"),
        v.literal("resolved"),
        v.literal("escalated")
      )
    ),
  },
  handler: async (ctx, { status, paginationOpts }) => {
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

    let conversations: PaginationResult<Doc<"conversations">>;

    if (status) {
      conversations = await ctx.db
        .query("conversations")
        .withIndex("by_status_and_org_id", (q) =>
          q.eq("status", status).eq("organizationId", organizationId)
        )
        .order("desc")
        .paginate(paginationOpts);
    } else {
      conversations = await ctx.db
        .query("conversations")
        .withIndex("organizationId", (q) =>
          q.eq("organizationId", organizationId)
        )
        .order("desc")
        .paginate(paginationOpts);
    }

    const conversationsWithData = await Promise.all(
      conversations.page.map(async (conversation) => {
        const widgetSession = await ctx.db.get(conversation.widgetSessionId);

        if (!widgetSession) {
          return null;
        }

        const messages = await supportAgent.listMessages(ctx, {
          threadId: conversation.threadId,
          paginationOpts: { numItems: 1, cursor: null },
        });

        return {
          ...conversation,
          widgetSession,
          lastMessage: messages.page[0],
        };
      })
    );

    const validConversations = conversationsWithData.filter(
      (conversation): conversation is NonNullable<typeof conversation> =>
        !!conversation
    );

    return {
      ...conversations,
      page: validConversations,
    };
  },
});

export const updateStatus = mutation({
  args: {
    conversationId: v.id("conversations"),
    status: v.optional(
      v.union(
        v.literal("unresolved"),
        v.literal("resolved"),
        v.literal("escalated")
      )
    ),
  },
  handler: async (ctx, { conversationId, status }) => {
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

    if (!conversation) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Conversation not found!",
      });
    }

    if (conversation.organizationId !== user.currentOrganizationId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid organization id",
      });
    }

    await ctx.db.patch(conversationId, {
      status: status,
    });
  },
});
