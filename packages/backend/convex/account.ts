import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { accountSchema } from "./schema";

export const createAccount = mutation({
  args: { account: v.object(accountSchema) },
  handler: async (ctx, { account }) => {
    const existing = await ctx.db
      .query("accounts")
      .withIndex("providerAndAccountId", (q) =>
        q
          .eq("provider", account.provider)
          .eq("providerAccountId", account.providerAccountId)
      )
      .unique();

    if (existing) throw new Error("Account already exists");

    return ctx.db.insert("accounts", account);
  },
});

export const getAccount = query({
  args: {
    provider: v.optional(v.string()),
    providerAccountId: v.optional(v.string()),
  },
  handler: async (ctx, { provider, providerAccountId }) => {
    if (!provider || !providerAccountId) return null;

    const account = await ctx.db
      .query("accounts")
      .withIndex("providerAndAccountId", (q) =>
        q.eq("provider", provider).eq("providerAccountId", providerAccountId)
      )
      .unique();

    return account;
  },
});
