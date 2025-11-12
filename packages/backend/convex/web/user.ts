import { ConvexError, v } from "convex/values";
import { partial } from "convex-helpers/validators";
import type { Id } from "@/_generated/dataModel";
import { mutation, query } from "../_generated/server";
import { userSchema } from "../schema";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "You are not signed in.",
      });
    }

    return await ctx.db.get(identity.subject as Id<"users">);
  },
});

export const update = mutation({
  args: {
    user: v.object({
      ...partial(userSchema),
    }),
  },
  handler: async (ctx, { user: { ...data } }) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "You are not signed in.",
      });
    }

    const existingUser = await ctx.db.get(identity.subject as Id<"users">);

    if (!existingUser) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "User not found",
      });
    }

    return await ctx.db.patch(existingUser._id, data);
  },
});
