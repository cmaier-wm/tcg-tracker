import crypto from "node:crypto";
import { badRequest } from "@/lib/api/http-errors";

const ENCRYPTION_ENV_NAME = "TEAMS_WEBHOOK_ENCRYPTION_KEY";

function getEncryptionKey() {
  const secret = process.env[ENCRYPTION_ENV_NAME];

  if (!secret) {
    throw badRequest(
      "Teams alert encryption is not configured. Set TEAMS_WEBHOOK_ENCRYPTION_KEY."
    );
  }

  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptWebhookUrl(webhookUrl: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(webhookUrl, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    encryptedWebhookUrl: encrypted.toString("base64"),
    webhookUrlIv: Buffer.concat([iv, authTag]).toString("base64")
  };
}

export function decryptWebhookUrl(encryptedWebhookUrl: string, webhookUrlIv: string) {
  const combined = Buffer.from(webhookUrlIv, "base64");
  const iv = combined.subarray(0, 12);
  const authTag = combined.subarray(12);
  const decipher = crypto.createDecipheriv("aes-256-gcm", getEncryptionKey(), iv);

  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedWebhookUrl, "base64")),
    decipher.final()
  ]);

  return decrypted.toString("utf8");
}
