import { ConvexError, v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import { mutation, query } from "../_generated/server";

export const create = mutation({
  args: { name: v.string(), slug: v.string() },
  handler: async (ctx, { name, slug }) => {
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

    const sanitizedSlug = slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/--+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (sanitizedSlug.length < 3 || sanitizedSlug.length > 20) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Invalid slug",
      });
    }

    const existingOrganization = await ctx.db
      .query("organizations")
      .withIndex("slug", (q) => q.eq("slug", sanitizedSlug))
      .unique();

    if (existingOrganization) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Slug already taken",
      });
    }

    const orgCount = await ctx.db
      .query("organizations")
      .withIndex("ownerId", (q) => q.eq("ownerId", user._id))
      .collect();

    if (orgCount.length >= 3) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Maximum organization limit reached.",
      });
    }

    const organizationId = await ctx.db.insert("organizations", {
      name,
      slug: sanitizedSlug,
      ownerId: user._id,
    });

    await ctx.db.insert("members", {
      userId: user._id,
      organizationId: organizationId,
      role: "owner",
      joinedAt: Date.now(),
    });

    await ctx.db.patch(user._id, { currentOrganizationId: organizationId });

    return sanitizedSlug;
  },
});

export const selected = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db.get(identity.subject as Id<"users">);
    if (!user?.currentOrganizationId) return null;

    return await ctx.db.get(user.currentOrganizationId);
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db.get(identity.subject as Id<"users">);

    if (!user) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "User not found",
      });
    }

    const userMemberships = await ctx.db
      .query("members")
      .withIndex("userId", (q) => q.eq("userId", user._id))
      .collect();

    const orgIds = userMemberships.map((m) => m.organizationId);

    const orgsWithMembers = await Promise.all(
      orgIds.map(async (orgId) => {
        const org = await ctx.db.get(orgId);
        if (!org) return null;

        const members = await ctx.db
          .query("members")
          .withIndex("organizationId", (q) => q.eq("organizationId", orgId))
          .collect();

        return { ...org, members };
      })
    );

    return orgsWithMembers.filter((org) => org !== null);
  },
});

export const select = mutation({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, { organizationId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db.get(identity.subject as Id<"users">);

    if (!user) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "User not found",
      });
    }

    const membership = await ctx.db
      .query("members")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", user._id).eq("organizationId", organizationId)
      )
      .unique();

    if (!membership) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Not allowed",
      });
    }

    await ctx.db.patch(user._id, { currentOrganizationId: organizationId });
    return { success: true };
  },
});

export const validate = mutation({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, { organizationId }) => {
    const organization = await ctx.db.get(organizationId);

    if (!organization) {
      return {
        isValid: false,
        reason: "Organization not found!",
      };
    }

    return {
      isValid: true,
      organization,
    };
  },
});

export const validateSlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db.get(identity.subject as Id<"users">);

    if (!user) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "User not found",
      });
    }

    const sanitized = slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/--+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (sanitized.length < 3 || sanitized.length > 20) {
      return {
        isValid: false,
        reason: "Slug must be between 3 - 20 characters",
      };
    }

    const existingOrganization = await ctx.db
      .query("organizations")
      .withIndex("slug", (q) => q.eq("slug", sanitized))
      .unique();

    if (existingOrganization) {
      return {
        isValid: false,
        reason: "Slug already taken",
      };
    }

    return {
      isValid: true,
      reason: null,
    };
  },
});
