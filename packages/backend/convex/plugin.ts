import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

export const add = internalMutation({
  args: {
    keys: v.object({
      public: v.optional(v.string()),
      private: v.optional(v.string()),
      extra: v.optional(v.any()),
    }),
    service: v.union(v.literal("vapi")),
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, { keys, service, organizationId }) => {
    const existingPlugin = await ctx.db
      .query("plugins")
      .withIndex("by_organization_and_service", (q) =>
        q.eq("organizationId", organizationId).eq("service", service)
      )
      .unique();

    if (existingPlugin) {
      await ctx.db.patch(existingPlugin._id, {
        keys,
      });
    } else {
      await ctx.db.insert("plugins", {
        keys,
        service,
        organizationId,
      });
    }
  },
});

export const getByOrganizationIdAndService = internalQuery({
  args: {
    service: v.union(v.literal("vapi")),
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, { organizationId, service }) => {
    return await ctx.db
      .query("plugins")
      .withIndex("by_organization_and_service", (q) =>
        q.eq("organizationId", organizationId).eq("service", service)
      )
      .unique();
  },
});
