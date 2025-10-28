import { v } from "convex/values";
import { partial } from "convex-helpers/validators";
import { mutation, query } from "./_generated/server.js";
import { sessionSchema } from "./schema.js";

export const createSession = mutation({
  args: { session: v.object(sessionSchema) },
  handler: async (ctx, { session }) => {
    const existingSession = await ctx.db
      .query("sessions")
      .withIndex("sessionToken", (q) =>
        q.eq("sessionToken", session.sessionToken)
      )
      .unique();

    if (existingSession) throw new Error("Session already exists");

    return await ctx.db.insert("sessions", session);
  },
});

export const updateSession = mutation({
  args: {
    session: v.object({
      id: v.id("sessions"),
      ...partial(sessionSchema),
    }),
  },
  handler: async (ctx, { session: { id, ...data } }) => {
    const existingSession = await ctx.db.get(id);
    if (!existingSession) throw new Error("Session not found");

    await ctx.db.patch(id, data);
  },
});

export const getSession = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("sessionToken", (q) => q.eq("sessionToken", sessionToken))
      .unique();

    return session;
  },
});
