import { ConvexError, v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import { mutation, query } from "../_generated/server";

export const getAll = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, { organizationId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity)
      throw new ConvexError({ code: "UNAUTHORIZED", message: "Not signed in" });

    const userId = identity.subject as Id<"users">;
    const membership = await ctx.db
      .query("members")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", userId).eq("organizationId", organizationId)
      )
      .unique();

    if (!membership)
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "You are not a member of this organization",
      });

    return await ctx.db
      .query("members")
      .withIndex("organizationId", (q) =>
        q.eq("organizationId", organizationId)
      )
      .collect();
  },
});

export const add = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
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

    if (!user.currentOrganizationId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Organization not found",
      });
    }

    const organizationId = user.currentOrganizationId as Id<"organizations">;

    const membership = await ctx.db
      .query("members")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", user._id).eq("organizationId", organizationId)
      )
      .unique();

    if (!membership) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "You are not part of this organization",
      });
    }

    if (membership.role === "member") {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Only admin and owners can add members",
      });
    }

    const memberCount = await ctx.db
      .query("members")
      .withIndex("organizationId", (q) =>
        q.eq("organizationId", organizationId)
      )
      .collect();

    if (memberCount.length >= 5) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Organization has maximum members.",
      });
    }

    const existingMember = await ctx.db
      .query("members")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", userId).eq("organizationId", organizationId)
      )
      .unique();

    if (existingMember) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "User is already a member",
      });
    }

    await ctx.db.insert("members", {
      organizationId: organizationId,
      userId: userId,
      role: "member",
      joinedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
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

    if (!user.currentOrganizationId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Organization not found",
      });
    }

    const organizationId = user.currentOrganizationId as Id<"organizations">;

    const membership = await ctx.db
      .query("members")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", user._id).eq("organizationId", organizationId)
      )
      .unique();

    if (!membership) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "You are not part of this organization",
      });
    }

    if (membership.role === "member") {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Only admin and owners can remove members",
      });
    }

    const member = await ctx.db
      .query("members")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", userId).eq("organizationId", organizationId)
      )
      .unique();

    if (!member) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Member not found",
      });
    }

    if (membership.role === "admin" && member.role === "admin") {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Admins cannot add other admins",
      });
    }

    if (member.role === "owner") {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "You cannot remove the owner",
      });
    }

    await ctx.db.delete(member._id);
  },
});

export const changeRole = mutation({
  args: {
    memberId: v.id("members"),
    newRole: v.union(v.literal("admin"), v.literal("member")),
  },
  handler: async (ctx, { memberId, newRole }) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError({ code: "UNAUTHORIZED", message: "Not signed in" });
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

    if (!user?.currentOrganizationId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Organization not found",
      });
    }

    const organizationId = user.currentOrganizationId as Id<"organizations">;

    const userMembership = await ctx.db
      .query("members")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", user._id).eq("organizationId", organizationId)
      )
      .unique();

    if (!userMembership) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "You are not part of this organization",
      });
    }

    if (userMembership.role !== "owner" && newRole === "admin") {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Only the owner can promote a member to admin",
      });
    }

    const targetMember = await ctx.db.get(memberId);

    if (!targetMember) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Member not found",
      });
    }

    if (targetMember.organizationId !== organizationId) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Member does not belong to this organization",
      });
    }

    if (targetMember.role === newRole) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Member already has this role",
      });
    }

    await ctx.db.patch(memberId, { role: newRole });

    return { success: true };
  },
});
