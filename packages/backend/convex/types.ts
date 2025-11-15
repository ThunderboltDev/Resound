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

export type Metadata={
  organizationId: Id<"organizations">;
  title: string;
  category?: string;
}

export type FileEntryMetadata = Metadata & {
  storageId: Id<"_storage">;
  fileName: string;
};

export type PageEntryMetadata = Metadata & {
  
};
