import { productIdToPlanId } from "@workspace/config/plans";
import { httpRouter } from "convex/server";
import { verifyCreemSignature } from "@/lib/creem";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { httpAction } from "./_generated/server";

const http = httpRouter();

interface WebhookResponse {
  id: string;
  eventType: string;
  object: {
    request_id: string;
    object: string;
    id: string;
    customer: {
      id: string;
    };
    product: {
      id: string;
      billing_type: string;
    };
    subscription: {
      id: string;
      current_period_end_date: string;
    };
    status: string;
    current_period_end_date: string;
    metadata: {
      organizationId: string;
    };
  };
}

http.route({
  path: "/creem",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const rawBody = await request.text();
    const signature = request.headers.get("creem-signature");

    if (!signature || !verifyCreemSignature(rawBody, signature)) {
      return new Response("Invalid signature", { status: 400 });
    }

    const { object, eventType } = JSON.parse(rawBody) as WebhookResponse;

    switch (eventType) {
      case "subscription.paid":
      case "subscription.active":
      case "subscription.update":
      case "subscription.paused":
      case "subscription.canceled":
      case "subscription.trialing": {
        await ctx.runMutation(internal.subscription.upsert, {
          organizationId: object.metadata.organizationId as Id<"organizations">,
          customerId: object.customer.id,
          subscriptionId: object.id,
          status: object.status,
          planId: productIdToPlanId[object.product.id],
          currentPeriodEnd: new Date(
            object.current_period_end_date ??
              object.subscription.current_period_end_date
          ).getTime(),
        });
      }
    }

    return new Response("Webhook received successfully", { status: 200 });
  }),
});

// Auth.js

http.route({
  path: "/.well-known/openid-configuration",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(
      JSON.stringify({
        issuer: process.env.CONVEX_SITE_URL,
        jwks_uri: `${process.env.CONVEX_SITE_URL}/.well-known/jwks.json`,
        authorization_endpoint: `${process.env.CONVEX_SITE_URL}/oauth/authorize`,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control":
            "public, max-age=15, stale-while-revalidate=15, stale-if-error=86400",
        },
      }
    );
  }),
});

http.route({
  path: "/.well-known/jwks.json",
  method: "GET",
  handler: httpAction(async () => {
    if (process.env.JWKS === undefined) {
      throw new Error("Missing JWKS Convex environment variable");
    }
    return new Response(process.env.JWKS, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control":
          "public, max-age=15, stale-while-revalidate=15, stale-if-error=86400",
      },
    });
  }),
});

export default http;
