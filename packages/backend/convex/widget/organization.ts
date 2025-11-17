import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const validate = mutation({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, { organizationId }) => {
    const organization = await ctx.db.get(organizationId);

    if (!organization) {
      return {
        isValid: false,
        reason: "Organization not found!",
      };
    }

    return {
      isValid: true,
      organization,
    };
  },
});
