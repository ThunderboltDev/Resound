import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    sessionToken: string;
    convexToken?: string;
    userId: string;
    expires: Date;

    userAgent?: string;
    timezone?: string;
    country?: string;
    city?: string;

    createdAt: Date;
    lastActivity: Date;

    user: DefaultSession["user"] & {
      createdAt: Date;
      updatedAt: Date;
      lastLogin: Date;

      customerId?: string;
      subscriptionId?: string;
      currentPeriodEnd?: Date;
    };
  }
}
