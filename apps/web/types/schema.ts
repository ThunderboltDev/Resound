import type { Doc } from "@workspace/backend/_generated/dataModel";

export type User = Doc<"users">;

export type Organization = Doc<"organizations">;

export type OrganizationWithMembers = Doc<"organizations"> & {
  members: Doc<"members">[];
};
