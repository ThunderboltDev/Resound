import type { EntryId } from "@convex-dev/rag";
import type { Id } from "./_generated/dataModel";

export type UploadStatus = "ready" | "processing" | "error";

export type File = {
  id: EntryId;
  name: string;
  size: string;
  type: string;
  status: UploadStatus;
  url: string | null;
  category?: string;
};

export type EntryMetadata = {
  storageId: Id<"_storage">;
  organizationId: Id<"organizations">;
  fileName: string;
  category?: string;
};
