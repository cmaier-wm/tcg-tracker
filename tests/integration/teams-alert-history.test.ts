import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/settings/teams-alert/history/route";
import { getDemoStore, resetDemoStore } from "@/lib/db/demo-store";
import { addHolding } from "@/lib/portfolio/add-holding";
import { saveValuationSnapshot } from "@/lib/portfolio/save-valuation-snapshot";
import { updateHolding } from "@/lib/portfolio/update-holding";
import { upsertTeamsAlertSettings } from "@/lib/teams/alert-preferences";

const originalEncryptionKey = process.env.TEAMS_WEBHOOK_ENCRYPTION_KEY;

describe("teams alert history route", () => {
  beforeEach(() => {
    resetDemoStore();
    process.env.TEAMS_WEBHOOK_ENCRYPTION_KEY = "history-route-secret";
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

  it("returns paged Teams delivery history ordered newest first", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 202 })));

    await upsertTeamsAlertSettings({
      enabled: true,
      destinationLabel: "Trading alerts",
      triggerAmountUsd: 1000,
      webhookUrl: "https://example.com/workflows/hook"
    });

    await addHolding("onepiece-luffy-en-foil", 8);
    await saveValuationSnapshot();

    const holdingId = getDemoStore().holdings[0]?.id;

    expect(holdingId).toBeTruthy();

    await updateHolding(holdingId as string, 16);

    const response = await GET(
      new Request("http://localhost/api/settings/teams-alert/history?page=1&pageSize=1")
    );
    const payload = await response.json();

    expect(payload).toMatchObject({
      page: 1,
      pageSize: 1,
      totalItems: 2,
      totalPages: 2
    });
    expect(payload.items).toHaveLength(1);
    expect(payload.items[0]).toMatchObject({
      status: "sent",
      responseCode: 202
    });
  });
});
