import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetDemoStore } from "@/lib/db/demo-store";
import { getTeamsAlertSettings, upsertTeamsAlertSettings } from "@/lib/teams/alert-preferences";
import { buildTeamsWorkflowPayload } from "@/lib/teams/alert-delivery";
import { decryptWebhookUrl, encryptWebhookUrl } from "@/lib/teams/encrypt-webhook";
import { evaluatePortfolioAlert } from "@/lib/teams/evaluate-portfolio-alert";

const originalEncryptionKey = process.env.TEAMS_WEBHOOK_ENCRYPTION_KEY;

describe("teams alerts", () => {
  beforeEach(() => {
    resetDemoStore();
    process.env.TEAMS_WEBHOOK_ENCRYPTION_KEY = "unit-test-secret";
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

  it("encrypts and decrypts Teams webhook URLs", () => {
    const encrypted = encryptWebhookUrl("https://example.com/workflows/hook");

    expect(
      decryptWebhookUrl(encrypted.encryptedWebhookUrl, encrypted.webhookUrlIv)
    ).toBe("https://example.com/workflows/hook");
  });

  it("builds the Teams workflow payload summary", () => {
    const payload = buildTeamsWorkflowPayload({
      capturedAt: "2026-04-07T00:00:00.000Z",
      portfolioValue: 2100,
      baselineValue: 900,
      gainAmount: 1200,
      destinationLabel: "Trading alerts",
      userDisplayName: "Collector"
    });

    expect(payload).toMatchObject({
      type: "AdaptiveCard",
      version: "1.4"
    });
    expect(payload.body[1]).toMatchObject({
      type: "TextBlock",
      text: "Collector's portfolio gained $1200.00"
    });
    expect(payload.body[2]).toMatchObject({
      type: "FactSet"
    });
  });

  it("sends one alert and suppresses duplicates until the next $1,000 threshold", async () => {
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

    const firstResult = await evaluatePortfolioAlert({
      capturedAt: "2026-04-07T00:00:00.000Z",
      portfolioValue: 1100
    });
    const secondResult = await evaluatePortfolioAlert({
      capturedAt: "2026-04-07T00:01:00.000Z",
      portfolioValue: 1500
    });
    const thirdResult = await evaluatePortfolioAlert({
      capturedAt: "2026-04-07T00:02:00.000Z",
      portfolioValue: 2201
    });

    expect(firstResult.status).toBe("sent");
    expect(secondResult).toMatchObject({
      status: "idle",
      reason: "threshold-not-met"
    });
    expect(thirdResult.status).toBe("sent");
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const settings = await getTeamsAlertSettings();
    expect(settings.baselineValue).toBe(2201);
    expect(settings.deliveryStatus).toBe("sent");
  });

  it("keeps the baseline unchanged after a failed delivery so the next evaluation can retry", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("workflow offline", { status: 500 }))
      .mockResolvedValueOnce(new Response("", { status: 202 }));

    vi.stubGlobal("fetch", fetchMock);

    await upsertTeamsAlertSettings({
      enabled: true,
      destinationLabel: "Trading alerts",
      triggerAmountUsd: 1000,
      webhookUrl: "https://example.com/workflows/hook"
    });

    const failedResult = await evaluatePortfolioAlert({
      capturedAt: "2026-04-07T00:00:00.000Z",
      portfolioValue: 1500
    });
    let settings = await getTeamsAlertSettings();

    expect(failedResult.status).toBe("failed");
    expect(settings.deliveryStatus).toBe("failed");
    expect(settings.baselineValue).toBe(0);
    expect(settings.lastFailureMessage).toContain("workflow offline");

    const retriedResult = await evaluatePortfolioAlert({
      capturedAt: "2026-04-07T00:01:00.000Z",
      portfolioValue: 1500
    });
    settings = await getTeamsAlertSettings();

    expect(retriedResult.status).toBe("sent");
    expect(settings.baselineValue).toBe(1500);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("uses the configured trigger amount instead of the default threshold", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("", { status: 202 }));

    vi.stubGlobal("fetch", fetchMock);

    await upsertTeamsAlertSettings({
      enabled: true,
      destinationLabel: "Trading alerts",
      triggerAmountUsd: 250,
      webhookUrl: "https://example.com/workflows/hook"
    });

    const belowThreshold = await evaluatePortfolioAlert({
      capturedAt: "2026-04-07T00:00:00.000Z",
      portfolioValue: 250
    });
    const aboveThreshold = await evaluatePortfolioAlert({
      capturedAt: "2026-04-07T00:01:00.000Z",
      portfolioValue: 251
    });

    expect(belowThreshold).toMatchObject({
      status: "idle",
      reason: "threshold-not-met"
    });
    expect(aboveThreshold.status).toBe("sent");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
