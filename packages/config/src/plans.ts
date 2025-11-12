import { isDev } from "@workspace/config";

type PlanId = "basic" | "plus" | "premium";

export const plans = {
  basic: {
    id: "basic",
    name: "Basic",
    currency: "USD",
    price: {
      monthly: 0,
      yearly: 0,
    },
    productId: {
      monthly: "basic",
      yearly: "basc",
    },
  },
  plus: {
    id: "plus",
    name: "Plus",
    currency: "USD",
    price: {
      monthly: 29,
      yearly: 290,
    },
    productId: {
      monthly: isDev ? "prod_6EczoSW4ZQSFl4pcz6GGGa" : "",
      yearly: isDev ? "prod_tXQTtrM2yFZ5gpowv2ms2" : "",
    },
  },
  premium: {
    id: "premium",
    name: "Premium",
    currency: "USD",
    price: {
      monthly: 99,
      yearly: 990,
    },
    productId: {
      monthly: isDev ? "prod_4G4UhU5o2Ojm9QvMudScHJ" : "",
      yearly: isDev ? "prod_jIhMoTCF15dsvb6swrYQ8" : "",
    },
  },
} as const;

export const productIdToPlanId: Record<string, PlanId> = {
  basic: "basic",
  prod_6EczoSW4ZQSFl4pcz6GGGa: "plus",
  prod_tXQTtrM2yFZ5gpowv2ms2: "plus",
  prod_4G4UhU5o2Ojm9QvMudScHJ: "premium",
  prod_jIhMoTCF15dsvb6swrYQ8: "premium",
} as const;
