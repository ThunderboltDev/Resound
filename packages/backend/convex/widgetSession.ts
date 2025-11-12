import { v } from "convex/values";
import { internalQuery } from "./_generated/server";

export const get = internalQuery({
  args: {
    widgetSessionId: v.id("widgetSessions"),
  },
  handler: async (ctx, { widgetSessionId }) => {
    return await ctx.db.get(widgetSessionId);
  },
});
