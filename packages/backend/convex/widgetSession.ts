import { v } from "convex/values";
import { mutation } from "./_generated/server";

const SESSION_DURATION = 24 * 60 * 60 * 1000;

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    organizationId: v.id("organizations"),
    metadata: v.optional(
      v.object({
        userAgent: v.optional(v.string()),
        language: v.optional(v.string()),
        languages: v.optional(v.string()),
        screenResolution: v.optional(v.string()),
        viewportSize: v.optional(v.string()),
        timezone: v.optional(v.string()),
        timezoneName: v.optional(v.string()),
        timezoneOffset: v.optional(v.number()),
        hardwareConcurrency: v.optional(v.number()),
        online: v.optional(v.boolean()),
        cookiesEnabled: v.optional(v.boolean()),
        colorScheme: v.optional(v.string()),
        referrer: v.optional(v.string()),
        battery: v.optional(v.string()),
        currentUrl: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const expiresAt = now + SESSION_DURATION;

    return await ctx.db.insert("widgetSessions", {
      ...args,
      expiresAt,
    });
  },
});

export const validate = mutation({
  args: {
    widgetSessionId: v.id("widgetSessions"),
  },
  handler: async (ctx, { widgetSessionId }) => {
    const widgetSession = await ctx.db.get(widgetSessionId);

    if (!widgetSession) {
      return {
        isVaild: false,
        reason: "Session not found!",
      };
    }

    if (widgetSession.expiresAt < Date.now()) {
      return {
        isValid: false,
        reason: "Session expired!",
      };
    }

    return {
      isValid: true,
      widgetSession,
    };
  },
});
