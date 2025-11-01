import { v } from "convex/values";
import { partial } from "convex-helpers/validators";
import { mutation } from "./_generated/server";
import { userSchema } from "./schema";

export const error = mutation({
  args: {},
  handler: async () => {
    throw new Error("Error");
  },
});

export const updateUser = mutation({
  args: {
    user: v.object({
      id: v.id("users"),
      ...partial(userSchema),
    }),
  },
  handler: async (ctx, { user: { id, ...data } }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const existingUser = await ctx.db.get(id);
    if (!existingUser) throw new Error("User not found");

    return await ctx.db.patch(id, data);
  },
});
