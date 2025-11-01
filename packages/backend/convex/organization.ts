import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: { name: v.string(), slug: v.string() },
  handler: async (ctx, { name, slug }) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_id", (q) => q.eq("_id", identity.subject as Id<"users">))
      .unique();

    if (!user) throw new Error("User not found");

    const sanitizedSlug = slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/--+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (sanitizedSlug.length < 3 || sanitizedSlug.length > 20)
      throw new Error("Invalid slug");

    const existing = await ctx.db
      .query("organizations")
      .withIndex("slug", (q) => q.eq("slug", sanitizedSlug))
      .unique();

    if (existing) throw new Error("Organization slug already taken");

    // TODO: add limit to number of orgs
    // const existingOrganizations = await ctx.db
    //   .query("organizations")
    //   .withIndex("ownerId", (q) => q.eq("ownerId", user._id))
    //   .collect();

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
    return organizationId;
  },
});

export const selected = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_id", (q) => q.eq("_id", identity.subject as Id<"users">))
      .unique();

    if (!user) throw new Error("User not found");
    if (!user.currentOrganizationId) return null;

    return ctx.db.get(user.currentOrganizationId);
  },
});

export const all = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_id", (q) => q.eq("_id", identity.subject as Id<"users">))
      .unique();

    if (!user) throw new Error("User not found");

    const members = await ctx.db
      .query("members")
      .withIndex("userId", (q) => q.eq("userId", user._id))
      .collect();

    const orgIds = members.map((m) => m.organizationId);
    const orgs = await Promise.all(orgIds.map((id) => ctx.db.get(id)));

    return orgs.filter((org) => org !== null);
  },
});

export const select = mutation({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, { organizationId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_id", (q) => q.eq("_id", identity.subject as Id<"users">))
      .unique();

    if (!user) throw new Error("User not found");

    const membership = await ctx.db
      .query("members")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", user._id).eq("organizationId", organizationId)
      )
      .unique();

    if (!membership)
      throw new Error("You're not a member of this organization");

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
