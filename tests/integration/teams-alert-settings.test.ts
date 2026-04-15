import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GET, PUT } from "@/app/api/settings/teams-alert/route";
import { setTestAuthenticatedUser } from "@/lib/auth/auth-session";
import { resetDemoStore } from "@/lib/db/demo-store";

const originalEncryptionKey = process.env.TEAMS_WEBHOOK_ENCRYPTION_KEY;

describe("teams alert settings route", () => {
  beforeEach(() => {
    resetDemoStore();
    setTestAuthenticatedUser(undefined);
    process.env.TEAMS_WEBHOOK_ENCRYPTION_KEY = "settings-route-secret";
  });

  afterEach(() => {
    if (originalEncryptionKey === undefined) {
      delete process.env.TEAMS_WEBHOOK_ENCRYPTION_KEY;
    } else {
      process.env.TEAMS_WEBHOOK_ENCRYPTION_KEY = originalEncryptionKey;
    }
  });

  it("persists enable and disable transitions without losing the saved webhook", async () => {
    const enableResponse = await PUT(
      new Request("http://localhost/api/settings/teams-alert", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          enabled: true,
          destinationLabel: "Trading alerts",
          triggerAmountUsd: 1500,
          webhookUrl: "https://example.com/workflows/hook"
        })
      })
    );
    const enabledPayload = await enableResponse.json();

    expect(enabledPayload).toMatchObject({
      enabled: true,
      destinationLabel: "Trading alerts",
      triggerAmountUsd: 1500,
      hasWebhookUrl: true,
      webhookUrl: "https://example.com/workflows/hook",
      deliveryStatus: "idle"
    });

    const disableResponse = await PUT(
      new Request("http://localhost/api/settings/teams-alert", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          enabled: false,
          destinationLabel: "Trading alerts",
          triggerAmountUsd: 1500,
          webhookUrl: null
        })
      })
    );
    const disabledPayload = await disableResponse.json();

    expect(disabledPayload).toMatchObject({
      enabled: false,
      triggerAmountUsd: 1500,
      hasWebhookUrl: true,
      webhookUrl: "https://example.com/workflows/hook"
    });

    const reenableResponse = await PUT(
      new Request("http://localhost/api/settings/teams-alert", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          enabled: true,
          destinationLabel: "Trading alerts",
          triggerAmountUsd: 1500,
          webhookUrl: null
        })
      })
    );
    const reenabledPayload = await reenableResponse.json();

    expect(reenabledPayload).toMatchObject({
      enabled: true,
      triggerAmountUsd: 1500,
      hasWebhookUrl: true,
      webhookUrl: "https://example.com/workflows/hook"
    });

    const currentResponse = await GET();
    const currentPayload = await currentResponse.json();

    expect(currentPayload).toMatchObject({
      enabled: true,
      destinationLabel: "Trading alerts",
      triggerAmountUsd: 1500,
      hasWebhookUrl: true,
      webhookUrl: "https://example.com/workflows/hook"
    });
  });

  it("rebases the displayed baseline to the current portfolio value when alerts are disabled", async () => {
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

    const disableResponse = await PUT(
      new Request("http://localhost/api/settings/teams-alert", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          enabled: false,
          destinationLabel: "Trading alerts",
          triggerAmountUsd: 1000,
          webhookUrl: null
        })
      })
    );
    const disabledPayload = await disableResponse.json();

    expect(disabledPayload).toMatchObject({
      enabled: false,
      baselineValue: 0
    });
  });

  it("rejects settings writes when the current session is missing", async () => {
    setTestAuthenticatedUser(null);

    const response = await PUT(
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
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error).toBe("Authentication is required.");
  });
});
