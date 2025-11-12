"use node";

import { v } from "convex/values";
import { encryptSecret } from "@/lib/encryption";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";

export const add = internalAction({
  args: {
    keys: v.object({
      public: v.optional(v.string()),
      private: v.optional(v.string()),
      extra: v.optional(v.any()),
    }),
    service: v.union(v.literal("vapi")),
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, { keys, organizationId, service }) => {
    await ctx.runMutation(internal.plugin.add, {
      keys: {
        public: encryptSecret(keys?.public),
        private: encryptSecret(keys?.private),
        extra: encryptSecret(keys?.extra),
      },
      service,
      organizationId,
    });

    return { success: true };
  },
});
