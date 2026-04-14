import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GET, PUT } from "@/app/api/settings/teams-alert/route";
import { resetDemoStore } from "@/lib/db/demo-store";

const originalEncryptionKey = process.env.TEAMS_WEBHOOK_ENCRYPTION_KEY;

describe("teams alert settings contract", () => {
  beforeEach(() => {
    resetDemoStore();
    process.env.TEAMS_WEBHOOK_ENCRYPTION_KEY = "contract-test-secret";
  });

  afterEach(() => {
    if (originalEncryptionKey === undefined) {
      delete process.env.TEAMS_WEBHOOK_ENCRYPTION_KEY;
    } else {
      process.env.TEAMS_WEBHOOK_ENCRYPTION_KEY = originalEncryptionKey;
    }
  });

  it("returns the documented Teams alert settings shape", async () => {
    await PUT(
      new Request("http://localhost/api/settings/teams-alert", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          enabled: true,
          destinationLabel: "Trading alerts",
          triggerAmountUsd: 1000,
          webhookUrl: "https://example.com/workflows/hook"
        })
      })
    );

    const response = await GET();
    const payload = await response.json();

    expect(payload).toMatchObject({
      enabled: expect.any(Boolean),
      destinationLabel: expect.any(String),
      triggerAmountUsd: expect.any(Number),
      hasWebhookUrl: expect.any(Boolean),
      webhookUrl: expect.any(String),
      baselineValue: expect.any(Number),
      deliveryStatus: expect.stringMatching(/idle|sent|failed/)
    });
    expect(payload.lastEvaluatedAt).toBeNull();
    expect(payload.lastDeliveredAt).toBeNull();
    expect(payload.lastFailureAt).toBeNull();
  });
});
