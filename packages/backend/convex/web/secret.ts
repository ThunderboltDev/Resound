import { ConvexError, v } from "convex/values";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { mutation } from "../_generated/server";

export const add = mutation({
  args: {
    keys: v.object({
      public: v.optional(v.string()),
      private: v.optional(v.string()),
      extra: v.optional(v.any()),
    }),
    service: v.union(v.literal("vapi")),
  },
  handler: async (ctx, { keys, service }) => {
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

    // TODO: subscription check

    await ctx.scheduler.runAfter(0, internal.secret.add, {
      keys,
      service,
      organizationId,
    });
  },
});
