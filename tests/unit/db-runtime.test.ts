import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const queryRawMock = vi.fn();

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    $queryRaw: queryRawMock
  }
}));

const runtimeModule = await import("@/lib/db/runtime");

const {
  ensureDatabaseConnection,
  resetDatabaseAvailabilityCache,
  withDatabaseFallback
} = runtimeModule;

describe("database runtime fallback", () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;
  const originalTimeout = process.env.DATABASE_CONNECT_TIMEOUT_MS;

  beforeEach(() => {
    process.env.DATABASE_URL = "postgresql://example";
    process.env.DATABASE_CONNECT_TIMEOUT_MS = "25";
    queryRawMock.mockReset();
    resetDatabaseAvailabilityCache();
  });

  afterEach(() => {
    process.env.DATABASE_URL = originalDatabaseUrl;
    process.env.DATABASE_CONNECT_TIMEOUT_MS = originalTimeout;
    queryRawMock.mockReset();
    resetDatabaseAvailabilityCache();
  });

  it("returns false when the connectivity probe times out", async () => {
    queryRawMock.mockImplementation(
      () => new Promise(() => undefined)
    );

    await expect(ensureDatabaseConnection()).resolves.toBe(false);
  });

  it("falls back without running the database query after a timed out probe", async () => {
    queryRawMock.mockImplementation(
      () => new Promise(() => undefined)
    );

    const run = vi.fn(async () => "database");
    const fallback = vi.fn(async () => "fallback");

    await expect(withDatabaseFallback(run, fallback)).resolves.toBe("fallback");
    expect(run).not.toHaveBeenCalled();
    expect(fallback).toHaveBeenCalledOnce();
  });
});
