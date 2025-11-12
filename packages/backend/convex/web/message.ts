import { google } from "@ai-sdk/google";
import { saveMessage } from "@convex-dev/agent";
import { generateText } from "ai";
import { paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";
import { supportAgent } from "@/ai/support";
import { OPERATOR_MESSAGE_ENHANCEMENT_PROMPT } from "@/lib/prompts";
import { components } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { action, mutation, query } from "../_generated/server";

export const enhanceResponse = action({
  args: {
    response: v.string(),
  },
  handler: async (ctx, { response }) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }

    const enhancedResponse = await generateText({
      model: google("gemini-2.0-flash"),
      messages: [
        {
          role: "system",
          content: OPERATOR_MESSAGE_ENHANCEMENT_PROMPT,
        },
        {
          role: "user",
          content: response,
        },
      ],
    });

    return enhancedResponse.text;
  },
});

export const create = mutation({
  args: {
    message: v.string(),
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, { message, conversationId }) => {
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

    if (conversation.status === "resolved") {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Conversation resolved",
      });
    }

    if (conversation.status === "unresolved") {
      await ctx.db.patch(conversationId, {
        status: "escalated",
      });
    }

    await saveMessage(ctx, components.agent, {
      threadId: conversation.threadId,
      agentName: identity.subject,
      message: {
        role: "assistant",
        content: message,
      },
    });
  },
});

export const getMany = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { threadId, paginationOpts }) => {
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

    const conversation = await ctx.db
      .query("conversations")
      .withIndex("threadId", (q) => q.eq("threadId", threadId))
      .unique();

    if (!conversation) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Conversation not found",
      });
    }

    if (conversation.organizationId !== user.currentOrganizationId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid organization id",
      });
    }

    return await supportAgent.listMessages(ctx, {
      threadId,
      paginationOpts,
    });
  },
});
