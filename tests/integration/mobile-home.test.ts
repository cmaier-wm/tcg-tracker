import { beforeEach, describe, expect, it } from "vitest";
import { GET as getMobileHome } from "@/app/api/mobile/home/route";
import { GET as getMobileSession } from "@/app/api/mobile/session/route";
import { getDemoUserState, resetDemoStore } from "@/lib/db/demo-store";
import { setTestAuthenticatedUser } from "@/lib/auth/auth-session";
import { addHolding } from "@/lib/portfolio/add-holding";

describe("mobile home integration", () => {
  beforeEach(() => {
    resetDemoStore();
    setTestAuthenticatedUser(undefined);
  });

  it("returns authenticated session state for the current user", async () => {
    const response = await getMobileSession();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.status).toBe("authenticated");
    expect(payload.user).toMatchObject({
      userId: "demo-user",
      email: "collector@local.tcg"
    });
  });

  it("composes summary metrics for a populated portfolio", async () => {
    await addHolding("sv1-charizard-ex-en-nm-holo", 2);

    const response = await getMobileHome();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.displayName).toBe("Collector");
    expect(payload.holdingCount).toBeGreaterThan(0);
    expect(payload.totalCardQuantity).toBeGreaterThan(0);
    expect(payload.historyPreview.length).toBeGreaterThan(0);
    expect(payload.emptyState).toBe(false);
  });

  it("returns an empty-state summary when the user has no holdings", async () => {
    const store = getDemoUserState("demo-user");
    store.holdings = [];

    const response = await getMobileHome();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.holdingCount).toBe(0);
    expect(payload.totalCardQuantity).toBe(0);
    expect(payload.emptyState).toBe(true);
  });

  it("rejects summary access when the current session is missing", async () => {
    setTestAuthenticatedUser(null);

    const response = await getMobileHome();
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error).toBe("Authentication is required.");
  });
});
