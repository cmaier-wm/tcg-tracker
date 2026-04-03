import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

let cachedDatabaseAvailability: boolean | undefined;
let databaseAvailabilityPromise: Promise<boolean> | null = null;
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

async function isDatabaseAvailable() {
  if (!isDatabaseConfigured()) {
    return false;
  }

  if (cachedDatabaseAvailability !== undefined) {
    return cachedDatabaseAvailability;
  }

  if (!databaseAvailabilityPromise) {
    databaseAvailabilityPromise = ensureDatabaseConnection().then((available) => {
      cachedDatabaseAvailability = available;
      databaseAvailabilityPromise = null;
      return available;
    });
  }

  return databaseAvailabilityPromise;
}

export async function withDatabaseFallback<T>(
  run: () => Promise<T>,
  fallback: () => Promise<T> | T
) {
  if (!(await isDatabaseAvailable())) {
    return fallback();
  }

  try {
    return await run();
  } catch (error) {
    if (!isDatabaseConnectionError(error)) {
      throw error;
    }

    cachedDatabaseAvailability = false;

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
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export function resetDatabaseAvailabilityCache() {
  cachedDatabaseAvailability = undefined;
  databaseAvailabilityPromise = null;
  hasLoggedFallbackWarning = false;
}
