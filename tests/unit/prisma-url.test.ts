import { afterEach, beforeEach, describe, expect, it } from "vitest";

describe("normalizeDatabaseUrl", () => {
  const originalTimeout = process.env.DATABASE_CONNECT_TIMEOUT_MS;

  beforeEach(() => {
    process.env.DATABASE_CONNECT_TIMEOUT_MS = "2500";
  });

  afterEach(() => {
    process.env.DATABASE_CONNECT_TIMEOUT_MS = originalTimeout;
  });

  it("adds a PostgreSQL connect_timeout when one is missing", async () => {
    const { normalizeDatabaseUrl } = await import("@/lib/db/prisma");

    expect(
      normalizeDatabaseUrl("postgresql://collector:secret@example.com:5432/tcgtracker?schema=public")
    ).toBe(
      "postgresql://collector:secret@example.com:5432/tcgtracker?schema=public&connect_timeout=3"
    );
  });

  it("keeps an existing connect_timeout intact", async () => {
    const { normalizeDatabaseUrl } = await import("@/lib/db/prisma");

    expect(
      normalizeDatabaseUrl(
        "postgresql://collector:secret@example.com:5432/tcgtracker?schema=public&connect_timeout=9"
      )
    ).toBe(
      "postgresql://collector:secret@example.com:5432/tcgtracker?schema=public&connect_timeout=9"
    );
  });

  it("leaves non-PostgreSQL URLs unchanged", async () => {
    const { normalizeDatabaseUrl } = await import("@/lib/db/prisma");

    expect(normalizeDatabaseUrl("file:./dev.db")).toBe("file:./dev.db");
  });
});
