import { v } from "convex/values";
import { partial } from "convex-helpers/validators";
import { mutation, query } from "./_generated/server";
import { userSchema } from "./schema";

export const createUser = mutation({
  args: { user: v.object(userSchema) },
  handler: async (ctx, { user }) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", user.email))
      .unique();

    if (existingUser) throw new Error("User already exists");

    return await ctx.db.insert("users", user);
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
    const existingUser = await ctx.db.get(id);
    if (!existingUser) throw new Error("User not found");

    return await ctx.db.patch(id, data);
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .unique();

    return user;
  },
});
