import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const queryRawMock = vi.fn();

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    $queryRaw: queryRawMock
  }
}));

const runtimeModule = await import("@/lib/db/runtime");

const { ensureDatabaseConnection, resetDatabaseAvailabilityCache, withDatabaseFallback } =
  runtimeModule;

describe("database runtime fallback", () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;
  const originalTimeout = process.env.DATABASE_CONNECT_TIMEOUT_MS;
  const originalUseTestDatabase = process.env.USE_TEST_DATABASE;

  beforeEach(() => {
    process.env.DATABASE_URL = "postgresql://example";
    process.env.DATABASE_CONNECT_TIMEOUT_MS = "25";
    process.env.USE_TEST_DATABASE = "true";
    queryRawMock.mockReset();
    resetDatabaseAvailabilityCache();
  });

  afterEach(() => {
    process.env.DATABASE_URL = originalDatabaseUrl;
    process.env.DATABASE_CONNECT_TIMEOUT_MS = originalTimeout;
    process.env.USE_TEST_DATABASE = originalUseTestDatabase;
    queryRawMock.mockReset();
    resetDatabaseAvailabilityCache();
  });

  it("returns false when the connectivity probe times out", async () => {
    queryRawMock.mockImplementation(
      () => new Promise(() => undefined)
    );

    await expect(ensureDatabaseConnection()).resolves.toBe(false);
  });

  it("runs the database query when a database URL is configured", async () => {
    const run = vi.fn(async () => "database");
    const fallback = vi.fn(async () => "fallback");

    await expect(withDatabaseFallback(run, fallback)).resolves.toBe("database");
    expect(run).toHaveBeenCalledOnce();
    expect(fallback).not.toHaveBeenCalled();
  });
});
