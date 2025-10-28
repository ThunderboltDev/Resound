import { isDev } from "@workspace/config";

export const plans = {
  free: {
    id: "free",
    name: "Free",
    currency: "USD",
    price: {
      monthly: 0,
      yearly: 0,
    },
    productId: {
      monthly: "free",
      yearly: "free",
    },
    maxFileSize: "4MB",
    maxFileSizeInBytes: 4 * 1024 * 1024,
    maxFiles: 5,
    maxPages: 5,
  },
  pro: {
    id: "pro",
    name: "Pro",
    currency: "USD",
    price: {
      monthly: 9.99,
      yearly: 99.99,
    },
    productId: {
      monthly: isDev
        ? "prod_4ZtlEyxvUyIIMxSraQ7ZcT"
        : "prod_39PGhjrtoKxvMiRjyfkfct",
      yearly: isDev
        ? "prod_7G9AC88XkORnOM3vNiS3m4"
        : "prod_2ucrc2OavaNR9bRPpbKcd3",
    },
    maxFileSize: "16MB",
    maxFileSizeInBytes: 4 * 1024 * 1024,
    maxFiles: 25,
    maxPages: 25,
  },
};
