import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

const DEFAULT_DATABASE_CONNECT_TIMEOUT_MS = 3000;

let hasLoggedFallbackWarning = false;

export function isDatabaseConfigured() {
  if (process.env.NODE_ENV === "test" && process.env.USE_TEST_DATABASE !== "true") {
    return false;
  }

  return Boolean(process.env.DATABASE_URL);
}

function isDatabaseConnectionError(error: unknown) {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code === "P1001";
  }

  return (
    error instanceof Error &&
    /Can't reach database server|ECONNREFUSED|connect ECONNREFUSED|P1001/.test(
      error.message
    )
  );
}

function getDatabaseConnectTimeoutMs() {
  const configuredTimeout = Number.parseInt(
    process.env.DATABASE_CONNECT_TIMEOUT_MS ?? "",
    10
  );

  if (Number.isFinite(configuredTimeout) && configuredTimeout > 0) {
    return configuredTimeout;
  }

  return DEFAULT_DATABASE_CONNECT_TIMEOUT_MS;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  let timeoutId: NodeJS.Timeout | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error(`Database connection timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      })
    ]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

export async function withDatabaseFallback<T>(
  run: () => Promise<T>,
  fallback: () => Promise<T> | T
) {
  if (!isDatabaseConfigured()) {
    return fallback();
  }

  try {
    return await run();
  } catch (error) {
    if (!isDatabaseConnectionError(error)) {
      throw error;
    }

    if (process.env.NODE_ENV !== "production" && !hasLoggedFallbackWarning) {
      hasLoggedFallbackWarning = true;
      console.warn(
        "Database connection unavailable. Falling back to local demo data."
      );
    }

    return fallback();
  }
}

export async function ensureDatabaseConnection() {
  if (!isDatabaseConfigured()) {
    return false;
  }

  try {
    await withTimeout(
      prisma.$queryRaw`SELECT 1`,
      getDatabaseConnectTimeoutMs()
    );
    return true;
  } catch {
    return false;
  }
}

export function resetDatabaseAvailabilityCache() {
  hasLoggedFallbackWarning = false;
}
