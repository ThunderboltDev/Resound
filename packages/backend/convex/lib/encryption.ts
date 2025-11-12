"use node";

import crypto from "crypto";

if (!process.env.ENCRYPTION_KEY) {
  throw new Error("ENCRYPTION_KEY is missing in environment");
}

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, "hex");

if (ENCRYPTION_KEY.length !== 32) {
  throw new Error("ENCRYPTION_KEY must be 32 bytes (64 hex chars).");
}

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

export function encryptSecret(plainText: string | undefined) {
  if (!plainText) return undefined;

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decryptSecret(encryptedString: string) {
  const data = Buffer.from(encryptedString, "base64");
  const iv = data.subarray(0, IV_LENGTH);
  const tag = data.subarray(IV_LENGTH, IV_LENGTH + 16);
  const encrypted = data.subarray(IV_LENGTH + 16);

  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
