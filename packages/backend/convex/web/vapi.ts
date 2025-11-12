"use node";

import { type Vapi, VapiClient } from "@vapi-ai/server-sdk";
import { ConvexError } from "convex/values";
import { decryptSecret } from "@/lib/encryption";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { action } from "../_generated/server";

export const getAssistants = action({
  args: {},
  handler: async (ctx): Promise<Vapi.Assistant[]> => {
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

    const plugin = await ctx.runQuery(
      internal.plugin.getByOrganizationIdAndService,
      {
        organizationId,
        service: "vapi",
      }
    );

    if (!plugin) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Plugin not found.",
      });
    }

    if (!plugin.keys || !plugin.keys.private || !plugin.keys.public) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "API keys not found.",
      });
    }

    const privateApiKey = decryptSecret(plugin.keys.private);
    // const publicApiKey = decryptSecret(plugin.keys.public);

    const vapiClient = new VapiClient({
      token: privateApiKey,
    });

    return await vapiClient.assistants.list();
  },
});

export const getPhoneNumbers = action({
  args: {},
  handler: async (ctx): Promise<Vapi.PhoneNumbersListResponseItem[]> => {
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

    const plugin = await ctx.runQuery(
      internal.plugin.getByOrganizationIdAndService,
      {
        organizationId,
        service: "vapi",
      }
    );

    if (!plugin) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Plugin not found.",
      });
    }

    if (!plugin.keys || !plugin.keys.private || !plugin.keys.public) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "API keys not found.",
      });
    }

    const privateApiKey = decryptSecret(plugin.keys.private);
    // const publicApiKey = decryptSecret(plugin.keys.public);

    const vapiClient = new VapiClient({
      token: privateApiKey,
    });

    return await vapiClient.phoneNumbers.list();
  },
});
