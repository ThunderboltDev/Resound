import { ConvexError, v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import { mutation, query } from "../_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
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

    return await ctx.db
      .query("widgetSettings")
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", organizationId)
      )
      .unique();
  },
});

export const update = mutation({
  args: {
    greetingMessage: v.optional(v.string()),
    defaultSuggestions: v.array(v.string()),
    vapiSettings: v.object({
      assistantId: v.optional(v.string()),
      phoneNumber: v.optional(v.string()),
    }),
  },
  handler: async (
    ctx,
    { greetingMessage, defaultSuggestions, vapiSettings }
  ) => {
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

    const existingWidgetSettings = await ctx.db
      .query("widgetSettings")
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", organizationId)
      )
      .unique();

    if (existingWidgetSettings) {
      await ctx.db.patch(existingWidgetSettings._id, {
        greetingMessage,
        defaultSuggestions,
        vapiSettings,
      });
    } else {
      await ctx.db.insert("widgetSettings", {
        organizationId,
        greetingMessage,
        defaultSuggestions,
        vapiSettings,
      });
    }
  },
});
