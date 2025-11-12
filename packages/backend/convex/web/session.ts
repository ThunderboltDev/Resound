import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const remove = mutation({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const session = await ctx.db.get(sessionId);
    if (!session) throw new Error("Session not found");

    if (session.userId !== identity.subject) throw new Error("Forbidden");

    await ctx.db.delete(sessionId);
    return { success: true };
  },
});
