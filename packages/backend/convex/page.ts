import { vEntryId } from "@convex-dev/rag";
import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

export const get = internalQuery({
  args: {
    pageId: v.id("pages"),
  },
  handler: async (ctx, { pageId }) => {
    return await ctx.db.get(pageId);
  },
});

export const getAll = internalQuery({
  args: {
    websiteId: v.id("websites"),
  },
  handler: async (ctx, { websiteId }) => {
    return await ctx.db
      .query("pages")
      .withIndex("by_website_id", (q) => q.eq("websiteId", websiteId))
      .collect();
  },
});

export const add = internalMutation({
  args: {
    websiteId: v.id("websites"),
    entryId: vEntryId,
    title: v.string(),
    path: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("pages", args);
  },
});
