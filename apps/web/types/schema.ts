import type { Id } from "@workspace/backend/_generated/dataModel";

export type Organization = {
  _id: Id<"organizations">;
  _creationTime: number;
  name: string;
  ownerId: Id<"users">;
};
