import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import type { StorageActionWriter } from "convex/server";
import { ConvexError } from "convex/values";
import { assert } from "convex-helpers";
import type { Id } from "../_generated/dataModel";

const AI_MODELS = {
  image: google.chat("gemini-2.0-flash"),
  html: google.chat("gemini-2.0-flash"),
  pdf: google.chat("gemini-2.0-flash"),
} as const;

const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/webp",
  "image/png",
  "image/gif",
] as const;

const SYSTEM_PROMPTS = {
  image:
    "You turn images into text. If it is a photo of a document, transcribe it. If it is not a document, describe it.",
  pdf: "You transform PDF files into text.",
  html: "You transform content into markdown.",
} as const;

export type ExtractTextContentArgs = {
  storageId: Id<"_storage">;
  fileName: string;
  mimeType: string;
  bytes: ArrayBuffer;
};

export async function extractTextContent(
  ctx: { storage: StorageActionWriter },
  args: ExtractTextContentArgs
): Promise<string> {
  const { storageId, fileName, mimeType, bytes } = args;

  const url = await ctx.storage.getUrl(storageId);

  assert(url, "Failed to get storage URL");

  if (SUPPORTED_IMAGE_TYPES.some((type) => type === mimeType)) {
    return extractImageText(url);
  }

  if (mimeType.toLowerCase().includes("pdf")) {
    return extractPdfText(url, mimeType, fileName);
  }

  if (mimeType.toLowerCase().includes("text")) {
    return extractFileContent(ctx, storageId, bytes, mimeType);
  }

  throw new ConvexError({
    code: "BAD_REQUEST",
    message: `Unsupported mime type: ${mimeType}`,
  });
}

async function extractFileContent(
  ctx: { storage: StorageActionWriter },
  storageId: Id<"_storage">,
  bytes: ArrayBuffer,
  mimeType: string
) {
  const arrayBuffer =
    bytes ?? (await (await ctx.storage.get(storageId))?.arrayBuffer());

  if (!arrayBuffer) {
    throw new ConvexError("Failed to get file content");
  }

  const text = new TextDecoder().decode(arrayBuffer);

  if (mimeType.toLowerCase() !== "text/plain") {
    const result = await generateText({
      model: AI_MODELS.html,
      system: SYSTEM_PROMPTS.html,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text,
            },
            {
              type: "text",
              text: "Extract the text and print it in a markdown format without explaining that you'll do so.",
            },
          ],
        },
      ],
    });

    return result.text;
  }

  return text;
}

async function extractImageText(url: string) {
  const result = await generateText({
    model: AI_MODELS.image,
    system: SYSTEM_PROMPTS.image,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            image: new URL(url),
          },
        ],
      },
    ],
  });

  return result.text;
}

async function extractPdfText(url: string, mimeType: string, fileName: string) {
  const result = await generateText({
    model: AI_MODELS.pdf,
    system: SYSTEM_PROMPTS.pdf,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "file",
            data: new URL(url),
            filename: fileName,
            mediaType: mimeType,
          },
          {
            type: "text",
            text: "Extract the text from PDF without explaining you'll do so.",
          },
        ],
      },
    ],
  });

  return result.text;
}
