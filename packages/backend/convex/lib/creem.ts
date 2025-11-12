import { isDev } from "@workspace/config";
import { CreemCore } from "creem/core.js";

if (!process.env.CREEM_API_KEY) {
  throw new Error("Missing CREEM_API_KEY environment variable");
}

if (!process.env.CREEM_WEBHOOK_SECRET) {
  throw new Error("Missing CREEM_API_KEY in environment variables");
}

const CREEM_WEBHOOK_SECRET = process.env.CREEM_WEBHOOK_SECRET;

export const xApiKey = process.env.CREEM_API_KEY;

export const creem = new CreemCore({
  serverIdx: isDev ? 1 : 0,
});

export async function verifyCreemSignature(payload: string, signature: string) {
  const secret = CREEM_WEBHOOK_SECRET ?? "";
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: { name: "SHA-256" } },
    false,
    ["verify"]
  );

  if (signature.startsWith("sha256=")) signature = signature.slice(7);
  const bytes = /^[0-9a-fA-F]+$/.test(signature)
    ? new Uint8Array(
        (signature.match(/.{1,2}/g) ?? []).map((b) => parseInt(b, 16))
      )
    : Uint8Array.from(atob(signature), (c) => c.charCodeAt(0));

  return crypto.subtle.verify("HMAC", key, bytes, encoder.encode(payload));
}
