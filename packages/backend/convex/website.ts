import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

export const get = internalQuery({
  args: {
    websiteId: v.id("websites"),
  },
  handler: async (ctx, { websiteId }) => {
    return await ctx.db.get(websiteId);
  },
});

export const getAll = internalQuery({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, { organizationId }) => {
    return await ctx.db
      .query("websites")
      .withIndex("organizationId", (q) =>
        q.eq("organizationId", organizationId)
      )
      .collect();
  },
});

export const updateStatus = internalMutation({
  args: {
    websiteId: v.id("websites"),
    reason: v.optional(v.string()),
    status: v.union(
      v.literal("unverified"),
      v.literal("verified"),
      v.literal("failed")
    ),
    verifiedAt: v.optional(v.number()),
    verificationMethod: v.optional(
      v.union(v.literal("meta-tag"), v.literal("html-file"))
    ),
  },
  handler: async (
    ctx,
    { websiteId, status, reason, verifiedAt, verificationMethod }
  ) => {
    return await ctx.db.patch(websiteId, {
      status,
      reason,
      verifiedAt,
      verificationMethod,
    });
  },
});
