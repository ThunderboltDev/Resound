import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { internalMutation, internalQuery } from "./_generated/server";

export const upsert = internalMutation({
  args: {
    organizationId: v.id("organizations"),
    subscriptionId: v.optional(v.string()),
    customerId: v.optional(v.string()),
    status: v.optional(v.string()),
    planId: v.optional(v.string()),
    currentPeriodEnd: v.optional(v.number()),
  },
  handler: async (
    ctx,
    {
      organizationId,
      subscriptionId,
      customerId,
      status,
      planId,
      currentPeriodEnd,
    }
  ) => {
    const existingSubscription = await ctx.db
      .query("subscriptions")
      .withIndex("organizationId", (q) =>
        q.eq("organizationId", organizationId)
      )
      .unique();

    if (existingSubscription) {
      await ctx.db.patch(existingSubscription._id, {
        customerId,
        subscriptionId,
        currentPeriodEnd,
        planId: planId as Doc<"subscriptions">["planId"],
        status: status as Doc<"subscriptions">["status"],
      });
    } else {
      await ctx.db.insert("subscriptions", {
        customerId,
        subscriptionId,
        organizationId,
        currentPeriodEnd,
        planId: planId as Doc<"subscriptions">["planId"],
        status: status as Doc<"subscriptions">["status"],
      });
    }
  },
});

export const getByOrganizationId = internalQuery({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, { organizationId }) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("organizationId", (q) =>
        q.eq("organizationId", organizationId)
      )
      .unique();
  },
});
