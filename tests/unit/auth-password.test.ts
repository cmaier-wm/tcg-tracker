import { beforeEach, describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { claimLegacyBootstrapData } from "@/lib/auth/legacy-bootstrap";
import { getDemoStore, getDemoUserState, resetDemoStore } from "@/lib/db/demo-store";

describe("auth password helpers", () => {
  beforeEach(() => {
    resetDemoStore();
  });

  it("hashes passwords and verifies the correct secret", async () => {
    const passwordHash = await hashPassword("password123");

    expect(passwordHash).not.toBe("password123");
    await expect(verifyPassword("password123", passwordHash)).resolves.toBe(true);
    await expect(verifyPassword("wrong-password", passwordHash)).resolves.toBe(false);
  });

  it("claims legacy portfolio data exactly once for the first registered user", async () => {
    const store = getDemoStore();
    const originalLegacyState = getDemoUserState("demo-user");
    const originalHoldingsCount = originalLegacyState.holdings.length;
    const originalHistoryCount = originalLegacyState.portfolioHistory.length;

    store.users.push({
      id: "user-1",
      email: "collector@example.com",
      displayName: "Collector",
      isLegacyDefault: false,
      legacyClaimedAt: null
    });

    const claimed = await claimLegacyBootstrapData("user-1");
    const legacyState = getDemoUserState("demo-user");
    const nextState = getDemoUserState("user-1");

    expect(claimed).toBe(true);
    expect(nextState.holdings).toHaveLength(originalHoldingsCount);
    expect(nextState.portfolioHistory).toHaveLength(originalHistoryCount);
    expect(legacyState.holdings).toHaveLength(0);
    expect(legacyState.portfolioHistory).toHaveLength(0);

    const claimedAgain = await claimLegacyBootstrapData("user-1");
    expect(claimedAgain).toBe(false);
  });
});
