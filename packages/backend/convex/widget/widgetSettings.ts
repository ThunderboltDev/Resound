import { v } from "convex/values";
import { query } from "../_generated/server";

export const getByOrganizationId = query({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, { organizationId }) => {
    return await ctx.db
      .query("widgetSettings")
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", organizationId)
      )
      .unique();
  },
});
