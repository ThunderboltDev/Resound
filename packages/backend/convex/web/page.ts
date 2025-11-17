import { contentHashFromArrayBuffer } from "@convex-dev/rag";
import * as cheerio from "cheerio";
import { ConvexError, v } from "convex/values";
import type { Id } from "@/_generated/dataModel";
import rag from "@/ai/rag";
import { htmlToMarkdown } from "@/lib/htmlToMarkdown";
import { normalizeUrl } from "@/lib/url";
import type { PageEntryMetadata } from "@/types";
import { internal } from "../_generated/api";
import { action, mutation, query } from "../_generated/server";

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

    const fullUrl = normalizeUrl(path, website.url);

    const existing = pages.find((page) => {
      const existingUrl = normalizeUrl(page.path, website.url);
      return existingUrl === fullUrl;
    });

    if (existing) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "This page is already indexed",
      });
    }

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

    const markdown = htmlToMarkdown(html);

    const { entryId } = await rag.add(ctx, {
      namespace: organizationId,
      text: markdown,
      key: fullUrl,
      title: fullUrl,
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

export const remove = mutation({
  args: {
    pageId: v.id("pages"),
  },
  handler: async (ctx, { pageId }) => {
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

    const page = await ctx.db.get(pageId);

    if (!page) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "",
      });
    }

    const website = await ctx.db.get(page?.websiteId);

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

    const namespace = await rag.getNamespace(ctx, {
      namespace: organizationId,
    });

    if (!namespace) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid namespace",
      });
    }

    const entry = await rag.getEntry(ctx, {
      entryId: page.entryId,
    });

    if (!entry) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "entry not found",
      });
    }

    if (entry.metadata?.organizationId !== organizationId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid organization ID",
      });
    }

    if (entry.metadata?.storageId) {
      await ctx.storage.delete(entry.metadata.storageId as Id<"_storage">);
    }

    await rag.deleteAsync(ctx, {
      entryId: page.entryId,
    });

    await ctx.db.delete(pageId);
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
