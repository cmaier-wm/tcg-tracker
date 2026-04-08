import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getDemoStore, resetDemoStore } from "@/lib/db/demo-store";
import { addHolding } from "@/lib/portfolio/add-holding";
import { saveValuationSnapshot } from "@/lib/portfolio/save-valuation-snapshot";
import { updateHolding } from "@/lib/portfolio/update-holding";
import { getTeamsAlertSettings, upsertTeamsAlertSettings } from "@/lib/teams/alert-preferences";

const originalEncryptionKey = process.env.TEAMS_WEBHOOK_ENCRYPTION_KEY;

describe("teams alert delivery integration", () => {
  beforeEach(() => {
    resetDemoStore();
    process.env.TEAMS_WEBHOOK_ENCRYPTION_KEY = "integration-test-secret";
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    if (originalEncryptionKey === undefined) {
      delete process.env.TEAMS_WEBHOOK_ENCRYPTION_KEY;
    } else {
      process.env.TEAMS_WEBHOOK_ENCRYPTION_KEY = originalEncryptionKey;
    }
  });

  it("delivers alerts from valuation snapshots and suppresses duplicate sends", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("", { status: 202 }));

    vi.stubGlobal("fetch", fetchMock);

    await upsertTeamsAlertSettings({
      enabled: true,
      destinationLabel: "Trading alerts",
      triggerAmountUsd: 1000,
      webhookUrl: "https://example.com/workflows/hook"
    });

    await addHolding("onepiece-luffy-en-foil", 8);
    await saveValuationSnapshot();

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const holdingId = getDemoStore().holdings[0]?.id;

    expect(holdingId).toBeTruthy();

    await updateHolding(holdingId as string, 16);

    expect(fetchMock).toHaveBeenCalledTimes(2);

    const settings = await getTeamsAlertSettings();
    expect(settings.deliveryStatus).toBe("sent");
    expect(settings.baselineValue).toBeGreaterThan(2000);
  });

  it("surfaces delivery failure state when Teams rejects the webhook", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("workflow offline", { status: 500 }))
    );

    await upsertTeamsAlertSettings({
      enabled: true,
      destinationLabel: "Trading alerts",
      triggerAmountUsd: 1000,
      webhookUrl: "https://example.com/workflows/hook"
    });

    await addHolding("onepiece-luffy-en-foil", 8);

    const settings = await getTeamsAlertSettings();
    expect(settings.deliveryStatus).toBe("failed");
    expect(settings.lastFailureMessage).toContain("workflow offline");
    expect(settings.baselineValue).toBe(0);
  });
});
