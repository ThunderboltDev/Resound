import { ConvexHttpClient } from "convex/browser";

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("env variable NEXT_PUBLIC_CONVEX_URL is missing");
}

export const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
