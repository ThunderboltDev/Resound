"use node";

import { v } from "convex/values";
import { decryptSecret } from "@/lib/encryption";
import { internal } from "../_generated/api";
import { action } from "../_generated/server";

export const getVapi = action({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (
    ctx,
    { organizationId }
  ): Promise<{ public: string; private: string } | null> => {
    const plugin = await ctx.runQuery(
      internal.plugin.getByOrganizationIdAndService,
      {
        organizationId,
        service: "vapi",
      }
    );

    if (!plugin?.keys || !plugin.keys.private || !plugin.keys.public) {
      return null;
    }

    return {
      public: decryptSecret(plugin.keys.public),
      private: decryptSecret(plugin.keys.private),
    };
  },
});
