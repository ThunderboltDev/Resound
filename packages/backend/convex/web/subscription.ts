import { url } from "@workspace/config";
import { plans } from "@workspace/config/plans";
import { ConvexError, v } from "convex/values";
import { cancelSubscription } from "creem/funcs/cancelSubscription.js";
import { createCheckout } from "creem/funcs/createCheckout.js";
import { generateCustomerLinks } from "creem/funcs/generateCustomerLinks.js";
import { searchTransactions } from "creem/funcs/searchTransactions.js";
import { creem, xApiKey } from "@/lib/creem";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { action, query } from "../_generated/server";

type PlanTier = keyof typeof plans;

interface SubscriptionInfo {
  currentPeriodEnd: number | null;
  subscriptionId: string | null;
  customerId: string | null;
  planId: PlanTier;
  plan: (typeof plans)[PlanTier];
  status: string;
}

export const get = query({
  args: {},
  handler: async (ctx): Promise<SubscriptionInfo> => {
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

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("organizationId", (q) =>
        q.eq("organizationId", organizationId)
      )
      .unique();

    if (!subscription) {
      return {
        currentPeriodEnd: null,
        subscriptionId: null,
        customerId: null,
        planId: "basic",
        plan: plans.basic,
        status: "active",
      };
    }

    return {
      currentPeriodEnd: subscription.currentPeriodEnd ?? null,
      subscriptionId: subscription.subscriptionId ?? null,
      customerId: subscription.customerId ?? null,
      planId: "basic",
      plan: plans.basic,
      status: "active",
    };
  },
});

export const createCheckoutSession = action({
  args: {
    planId: v.union(v.literal("plus"), v.literal("premium")),
    billingPeriod: v.union(v.literal("monthly"), v.literal("yearly")),
    discountCode: v.optional(v.string()),
  },
  handler: async (ctx, { planId, billingPeriod, discountCode }) => {
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
        message: "organization ID not found",
      });
    }

    const result = await createCheckout(creem, {
      createCheckoutRequest: {
        customer: {
          email: user.email,
        },
        metadata: {
          organizationId: organizationId,
        },
        productId: plans[planId].productId[billingPeriod],
        successUrl: `${url}/thank-you`,
        discountCode,
      },
      xApiKey: xApiKey,
    });

    if (!result.ok) {
      throw new ConvexError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong!",
      });
    }

    return result.value?.checkoutUrl;
  },
});

export const getBillingPortalUrl = action({
  args: {},
  handler: async (ctx) => {
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
        message: "organization ID not found",
      });
    }

    const subscription = await ctx.runQuery(
      internal.subscription.getByOrganizationId,
      {
        organizationId,
      }
    );

    if (!subscription?.customerId) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Customer ID not found",
      });
    }

    const result = await generateCustomerLinks(creem, {
      createCustomerPortalLinkRequestEntity: {
        customerId: subscription.customerId,
      },
      xApiKey: xApiKey,
    });

    if (!result.ok) {
      throw new ConvexError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong!",
      });
    }

    return result.value?.customerPortalLink;
  },
});

export const cancel = action({
  args: {},
  handler: async (ctx) => {
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
        message: "organization ID not found",
      });
    }

    const subscription = await ctx.runQuery(
      internal.subscription.getByOrganizationId,
      {
        organizationId,
      }
    );

    if (!subscription?.subscriptionId) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Subscription ID not found",
      });
    }

    await cancelSubscription(creem, {
      id: subscription.subscriptionId,
      xApiKey: xApiKey,
    });

    return { success: true };
  },
});

export const getTransactionHistory = action({
  args: {},
  handler: async (ctx) => {
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
        message: "organization ID not found",
      });
    }

    const subscription = await ctx.runQuery(
      internal.subscription.getByOrganizationId,
      {
        organizationId,
      }
    );

    if (!subscription?.customerId) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Customer ID not found",
      });
    }

    const result = await searchTransactions(creem, {
      customerId: subscription.customerId,
      pageNumber: 1,
      xApiKey: xApiKey,
    });

    if (!result.ok) {
      throw new ConvexError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong!",
      });
    }

    return result.value;
  },
});
