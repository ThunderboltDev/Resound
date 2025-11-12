import {
  contentHashFromArrayBuffer,
  type Entry,
  guessMimeTypeFromContents,
  guessMimeTypeFromExtension,
  vEntryId,
} from "@convex-dev/rag";
import { paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";
import rag from "@/ai/rag";
import { extractTextContent } from "@/lib/extractTextContent";
import type { EntryMetadata, File } from "@/types";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { action, mutation, type QueryCtx, query } from "../_generated/server";

function guessMimeType(fileName: string, bytes: ArrayBuffer): string {
  return (
    guessMimeTypeFromExtension(fileName) ||
    guessMimeTypeFromContents(bytes) ||
    "application/octet-stream"
  );
}

export const add = action({
  args: {
    fileName: v.string(),
    mimeType: v.string(),
    bytes: v.bytes(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, { fileName, mimeType: mime, bytes, category }) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }

    const user = await ctx.runQuery(internal.user.getByUserId, {
      userId: identity.subject as Id<"users">,
    });

    if (!user) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "User not found",
      });
    }

    const organizationId = user.currentOrganizationId;

    if (!organizationId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "organization ID not found",
      });
    }

    const mimeType = mime || guessMimeType(fileName, bytes);
    const blob = new Blob([bytes], { type: mimeType });

    const storageId = await ctx.storage.store(blob);

    const text = await extractTextContent(ctx, {
      storageId,
      fileName,
      bytes,
      mimeType,
    });

    const { entryId, created } = await rag.add(ctx, {
      namespace: organizationId,
      text,
      key: fileName,
      title: fileName,
      metadata: {
        fileName,
        storageId,
        organizationId,
        userId: user._id,
        category: category ?? null,
      } as EntryMetadata,
      contentHash: await contentHashFromArrayBuffer(bytes),
    });

    if (!created) {
      console.debug("File already exists, skipping...");
      await ctx.storage.delete(storageId);
    }

    return {
      url: await ctx.storage.getUrl(storageId),
      entryId,
    };
  },
});

export const remove = mutation({
  args: {
    entryId: vEntryId,
  },
  handler: async (ctx, { entryId }) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_id", (q) => q.eq("_id", identity.subject as Id<"users">))
      .unique();

    if (!user) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "User not found",
      });
    }

    const organizationId = user.currentOrganizationId;

    if (!organizationId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "organization id not found",
      });
    }

    const namespace = await rag.getNamespace(ctx, {
      namespace: organizationId,
    });

    if (!namespace) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid namespace",
      });
    }

    const entry = await rag.getEntry(ctx, {
      entryId,
    });

    if (!entry) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "entry not found",
      });
    }

    if (entry.metadata?.organizationId !== organizationId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid organization ID",
      });
    }

    if (entry.metadata?.storageId) {
      await ctx.storage.delete(entry.metadata.storageId as Id<"_storage">);
    }

    await rag.deleteAsync(ctx, {
      entryId,
    });

    return {
      success: true,
      message: "File deleted successfully",
    };
  },
});

export const list = query({
  args: {
    category: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { category, paginationOpts }) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_id", (q) => q.eq("_id", identity.subject as Id<"users">))
      .unique();

    if (!user) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "User not found",
      });
    }

    const organizationId = user.currentOrganizationId;

    if (!organizationId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "organization id not found",
      });
    }

    const namespace = await rag.getNamespace(ctx, {
      namespace: organizationId,
    });

    if (!namespace) {
      return {
        page: [],
        isDone: true,
        continueCursor: "",
      };
    }

    const result = await rag.list(ctx, {
      namespaceId: namespace.namespaceId,
      paginationOpts: paginationOpts,
    });

    const files = await Promise.all(
      result.page.map((entry) => convertEntryToFile(ctx, entry))
    );

    const filteredFiles = category
      ? files.filter((file) => file?.category === category)
      : files;

    return {
      page: filteredFiles,
      isDone: result.isDone,
      continueCursor: result.continueCursor,
    };
  },
});

async function convertEntryToFile(ctx: QueryCtx, entry: Entry): Promise<File> {
  const { storageId, fileName, category } = entry.metadata as EntryMetadata;

  const storageMetadata = await ctx.db.system.get(storageId);

  const fileSize = formatFileSize(storageMetadata?.size);
  const extension = fileName.includes(".")
    ? (fileName.split(".").pop()?.toLowerCase() ?? "txt")
    : "txt";

  const status =
    entry.status === "ready"
      ? "ready"
      : entry.status === "pending"
        ? "processing"
        : "error";

  const url = storageId ? await ctx.storage.getUrl(storageId) : null;

  return {
    id: entry.entryId,
    name: fileName,
    size: fileSize,
    type: extension,
    status,
    url,
    category,
  };
}

function formatFileSize(bytes: number | undefined): string {
  if (bytes === undefined) return "---";
  if (bytes < 1024) return `${bytes}B`;

  const units = ["KB", "MB", "GB", "TB"];

  let unitIndex = 0;
  let size = bytes / 1024;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size < 10 ? size.toFixed(1) : Math.round(size)}${units[unitIndex]}`;
}
