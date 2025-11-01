import type { Id } from "./_generated/dataModel";
import { query } from "./_generated/server";

export const getAccounts = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_id", (q) => q.eq("_id", identity.subject as Id<"users">))
      .unique();

    if (!user) throw new Error("User not found");

    const accounts = await ctx.db
      .query("accounts")
      .withIndex("userId", (q) => q.eq("userId", user._id))
      .collect();

    return accounts;
  },
});
