import { ConvexError, v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import { mutation, query } from "../_generated/server";

export const get = query({
  args: {
    service: v.union(v.literal("vapi")),
  },
  handler: async (ctx, { service }) => {
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

    const plugin = await ctx.db
      .query("plugins")
      .withIndex("by_organization_and_service", (q) =>
        q.eq("organizationId", organizationId).eq("service", service)
      )
      .unique();

    if (!plugin) {
      return null;
    }

    const { keys: _, ...rest } = plugin;

    return rest;
  },
});

export const remove = mutation({
  args: {
    service: v.union(v.literal("vapi")),
  },
  handler: async (ctx, { service }) => {
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

    const existingPlugin = await ctx.db
      .query("plugins")
      .withIndex("by_organization_and_service", (q) =>
        q.eq("organizationId", organizationId).eq("service", service)
      )
      .unique();

    if (!existingPlugin) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Plugin not found.",
      });
    }

    await ctx.db.delete(existingPlugin._id);
  },
});
