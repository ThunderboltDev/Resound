import { ConvexError, v } from "convex/values";
import type { Id } from "@/_generated/dataModel";
import { internal } from "../_generated/api";
import { action, mutation, query } from "../_generated/server";

export const get = query({
  args: {
    websiteId: v.string(),
  },
  handler: async (ctx, { websiteId }) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_id", (q) => q.eq("_id", identity.subject as Id<"users">))
      .unique();

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

    return await ctx.db
      .query("websites")
      .withIndex("by_id", (q) => q.eq("_id", websiteId as Id<"websites">))
      .unique();
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_id", (q) => q.eq("_id", identity.subject as Id<"users">))
      .unique();

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

    return ctx.db
      .query("websites")
      .withIndex("organizationId", (q) =>
        q.eq("organizationId", organizationId)
      )
      .collect();
  },
});

export const link = mutation({
  args: {
    url: v.string(),
  },
  handler: async (ctx, { url }) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_id", (q) => q.eq("_id", identity.subject as Id<"users">))
      .unique();

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

    let normalizedUrl: URL;

    try {
      const parsedUrl = new URL(url.trim());

      parsedUrl.hash = "";
      parsedUrl.search = "";

      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        throw new ConvexError({
          code: "INVALID_ARGUMENT",
          message: "Invalid URL protocol",
        });
      }

      normalizedUrl = parsedUrl;
    } catch {
      throw new ConvexError({
        code: "INVALID_ARGUMENT",
        message: "Invalid url",
      });
    }

    const hostname = normalizedUrl.hostname;

    const privateIpPatterns = [
      /^127\./,
      /^10\./,
      /^192\.168\./,
      /^172\.(1[6-9]|2\d|3[0-1])\./,
      /^localhost$/i,
    ];

    for (const p of privateIpPatterns) {
      if (p.test(hostname)) {
        throw new ConvexError({
          code: "INVALID_ARGUMENT",
          message: "URL points to private or restricted host",
        });
      }
    }

    return await ctx.db.insert("websites", {
      organizationId,
      url: normalizedUrl.toString(),
      status: "unverified" as const,
      verificationToken: crypto.randomUUID(),
    });
  },
});

export const unlink = mutation({
  args: {
    id: v.id("websites"),
  },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_id", (q) => q.eq("_id", identity.subject as Id<"users">))
      .unique();

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

    const website = await ctx.db.get(id);

    if (organizationId !== website?.organizationId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "You do not have permission to do that",
      });
    }

    await ctx.db.delete(id);
  },
});

export const verify = action({
  args: {
    websiteId: v.id("websites"),
    verificationMethod: v.union(v.literal("html-file"), v.literal("meta-tag")),
  },
  handler: async (ctx, { websiteId, verificationMethod }) => {
    const website = await ctx.runQuery(internal.website.get, {
      websiteId,
    });

    if (!website) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Website not found",
      });
    }

    const { url, verificationToken } = website;

    if (!verificationToken || !verificationMethod) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Verification details not found",
      });
    }

    const hostname = new URL(url).hostname;

    if (verificationMethod === "html-file") {
      const response = await fetch(
        `https://${hostname}/resound-verification.html`
      );

      const text = await response.text();

      if (text.trim() !== verificationToken) {
        await ctx.runMutation(internal.website.updateStatus, {
          websiteId,
          status: "failed",
          reason: "File content did not match",
        });

        throw new ConvexError({
          code: "BAD_REQUEST",
          message: "File content did not match",
        });
      }
    } else if (verificationMethod === "meta-tag") {
      const response = await fetch(`https://${hostname}/`);
      const html = await response.text();

      const metaRegex = new RegExp(
        `<meta[^>]*name=["']resound-verification["'][^>]*content=["']${verificationToken}["']`,
        "i"
      );

      if (!metaRegex.test(html)) {
        await ctx.runMutation(internal.website.updateStatus, {
          websiteId,
          status: "failed",
          reason: "Meta tag not found",
        });

        throw new ConvexError({
          code: "BAD_REQUEST",
          message: "Meta tag not found",
        });
      }
    }

    await ctx.runMutation(internal.website.updateStatus, {
      websiteId,
      status: "verified",
      verifiedAt: Date.now(),
      verificationMethod,
    });

    return {
      success: true,
    };
  },
});
