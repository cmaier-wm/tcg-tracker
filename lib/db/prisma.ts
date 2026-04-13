import { PrismaClient } from "@prisma/client";

declare global {
  var __prisma: PrismaClient | undefined;
}

const DEFAULT_DATABASE_CONNECT_TIMEOUT_SECONDS = 3;

function getDatabaseConnectTimeoutSeconds() {
  const configuredTimeoutMs = Number.parseInt(
    process.env.DATABASE_CONNECT_TIMEOUT_MS ?? "",
    10
  );

  if (Number.isFinite(configuredTimeoutMs) && configuredTimeoutMs > 0) {
    return Math.max(1, Math.ceil(configuredTimeoutMs / 1000));
  }

  return DEFAULT_DATABASE_CONNECT_TIMEOUT_SECONDS;
}

export function normalizeDatabaseUrl(databaseUrl: string | undefined) {
  if (!databaseUrl) {
    return databaseUrl;
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(databaseUrl);
  } catch {
    return databaseUrl;
  }

  if (parsedUrl.protocol !== "postgresql:" && parsedUrl.protocol !== "postgres:") {
    return databaseUrl;
  }

  if (!parsedUrl.searchParams.has("connect_timeout")) {
    parsedUrl.searchParams.set(
      "connect_timeout",
      String(getDatabaseConnectTimeoutSeconds())
    );
  }

  return parsedUrl.toString();
}

process.env.DATABASE_URL = normalizeDatabaseUrl(process.env.DATABASE_URL);

export const prisma =
  global.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}
