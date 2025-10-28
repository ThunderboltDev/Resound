import { isDev } from "@workspace/config";
import { Creem } from "creem";
import type { SubscriptionEntity } from "creem/models/components";

export const creem = new Creem({
  serverIdx: isDev ? 1 : 0,
});

export function extractCustomerId(subscription: SubscriptionEntity) {
  return typeof subscription.customer === "string"
    ? subscription.customer
    : subscription.customer.id;
}
