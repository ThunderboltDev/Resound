import { contentHashFromArrayBuffer } from "@convex-dev/rag";
import * as cheerio from "cheerio";
import { ConvexError, v } from "convex/values";
import TurndownService from "turndown";
import type { Id } from "@/_generated/dataModel";
import rag from "@/ai/rag";
import type { PageEntryMetadata } from "@/types";
import { internal } from "../_generated/api";
import { action, query } from "../_generated/server";

export const add = action({
  args: {
    websiteId: v.id("websites"),
    path: v.string(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, { websiteId, path, category }) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }

    const user = await ctx.runQuery(internal.user.getByUserId, {
      userId: identity.subject as Id<"users">,
    });

    if (!user) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "User not found",
      });
    }

    const organizationId = user.currentOrganizationId;

    if (!organizationId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "organization id not found",
      });
    }

    const website = await ctx.runQuery(internal.website.get, {
      websiteId,
    });

    if (website?.organizationId !== organizationId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "You are not allowed to do that",
      });
    }

    const pages = await ctx.runQuery(internal.page.getAll, {
      websiteId,
    });

    if (pages.length >= 3) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "You have the maximum number of pages on a website",
      });
    }

    const fullUrl = new URL(path, website.url).toString();

    const response = await fetch(fullUrl);

    if (!response.ok) {
      throw new ConvexError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Could not fetch the page",
      });
    }

    const html = await response.text();

    const $ = cheerio.load(html);

    const title = $("title").text()?.trim() || "Untitled";

    const turndown = new TurndownService();
    const markdown = turndown.turndown(html);

    const { entryId } = await rag.add(ctx, {
      namespace: organizationId,
      text: markdown,
      key: fullUrl,
      title: path,
      metadata: {
        title,
        organizationId,
        userId: user._id,
        category: category ?? null,
      } as PageEntryMetadata,
      contentHash: await contentHashFromArrayBuffer(
        new TextEncoder().encode(markdown).buffer
      ),
    });

    await ctx.runMutation(internal.page.add, {
      websiteId,
      entryId,
      title,
      path,
    });
  },
});

export const getAll = query({
  args: {
    websiteId: v.id("websites"),
  },
  handler: async (ctx, { websiteId }) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }

    const user = await ctx.db.get(identity.subject as Id<"users">);

    if (!user) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "User not found",
      });
    }

    const organizationId = user.currentOrganizationId;

    if (!organizationId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "organization id not found",
      });
    }

    const website = await ctx.db.get(websiteId);

    if (!website) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Website not found",
      });
    }

    if (website?.organizationId !== organizationId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "You are not allowed to do that",
      });
    }

    return await ctx.db
      .query("pages")
      .withIndex("by_website_id", (q) => q.eq("websiteId", websiteId))
      .collect();
  },
});
