import { v } from "convex/values";
import { internalQuery } from "./_generated/server";

export const getByUserId = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    return await ctx.db.get(userId);
  },
});
