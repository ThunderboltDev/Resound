import { defineSchema, defineTable } from "convex/server";
import { type Validator, v } from "convex/values";

// Auth Tables

export const userSchema = {
  email: v.string(),
  name: v.optional(v.string()),
  image: v.optional(v.string()),

  currentOrganizationId: v.optional(v.id("organizations")),

  plan: v.union(v.literal("free"), v.literal("pro")),
  currentEndPeriod: v.optional(v.number()),

  lastLogin: v.number(),
};

export const accountSchema = {
  userId: v.id("users"),
  type: v.union(
    v.literal("email"),
    v.literal("oidc"),
    v.literal("oauth"),
    v.literal("webauthn"),
    v.literal("credentials")
  ),
  provider: v.string(),
  providerAccountId: v.string(),
  refresh_token: v.optional(v.string()),
  access_token: v.optional(v.string()),
  expires_at: v.optional(v.number()),
  token_type: v.optional(v.string() as Validator<Lowercase<string>>),
  scope: v.optional(v.string()),
  id_token: v.optional(v.string()),
  session_state: v.optional(v.string()),
};

export const sessionSchema = {
  userId: v.id("users"),
  expires: v.number(),
  sessionToken: v.string(),

  userAgent: v.optional(v.string()),
  timezone: v.optional(v.string()),
  country: v.optional(v.string()),
  city: v.optional(v.string()),

  lastActivity: v.optional(v.number()),
};

export const verificationTokenSchema = {
  identifier: v.string(),
  token: v.string(),
  expires: v.number(),
};

// Organizations Schema

export const organizationSchema = {
  name: v.string(),
  slug: v.string(),
  ownerId: v.id("users"),
};

export const memberSchema = {
  userId: v.id("users"),
  organizationId: v.id("organizations"),

  role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
  joinedAt: v.number(),
};

// Widget Schema

export const widgetSessionSchema = {
  name: v.string(),
  email: v.string(),
  organizationId: v.id("organizations"),
  expiresAt: v.number(),
  metadata: v.optional(
    v.object({
      userAgent: v.optional(v.string()),
      language: v.optional(v.string()),
      languages: v.optional(v.string()),
      screenResolution: v.optional(v.string()),
      viewportSize: v.optional(v.string()),
      timezone: v.optional(v.string()),
      timezoneName: v.optional(v.string()),
      timezoneOffset: v.optional(v.number()),
      hardwareConcurrency: v.optional(v.number()),
      online: v.optional(v.boolean()),
      cookiesEnabled: v.optional(v.boolean()),
      colorScheme: v.optional(v.string()),
      referrer: v.optional(v.string()),
      battery: v.optional(v.string()),
      currentUrl: v.optional(v.string()),
    })
  ),
};

export const conversationSchema = {
  threadId: v.string(),
  organizationId: v.id("organizations"),
  widgetSessionId: v.id("widgetSessions"),
  status: v.union(
    v.literal("unresolved"),
    v.literal("escalated"),
    v.literal("resolved")
  ),
};

const authTables = {
  users: defineTable(userSchema).index("email", ["email"]),
  sessions: defineTable(sessionSchema)
    .index("sessionToken", ["sessionToken"])
    .index("userId", ["userId"]),
  accounts: defineTable(accountSchema)
    .index("providerAndAccountId", ["provider", "providerAccountId"])
    .index("userId", ["userId"]),
  verificationTokens: defineTable(verificationTokenSchema).index(
    "identifierToken",
    ["identifier", "token"]
  ),
};

const orgTables = {
  organizations: defineTable(organizationSchema)
    .index("slug", ["slug"])
    .index("ownerId", ["ownerId"]),
  members: defineTable(memberSchema)
    .index("by_user_org", ["userId", "organizationId"])
    .index("organizationId", ["organizationId"])
    .index("userId", ["userId"]),
};

const widgetTables = {
  widgetSessions: defineTable(widgetSessionSchema)
    .index("by_org_id", ["organizationId"])
    .index("by_expires_at", ["expiresAt"]),
  conversations: defineTable(conversationSchema)
    .index("threadId", ["threadId"])
    .index("organizationId", ["organizationId"])
    .index("widgetSessionId", ["widgetSessionId"])
    .index("by_status_and_org_id", ["status", "organizationId"]),
};

export default defineSchema(
  {
    ...authTables,
    ...orgTables,
    ...widgetTables,
  },
  {
    schemaValidation: false,
  }
);
