import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SettingsPage } from "@/components/settings/settings-page";

describe("settings page contract", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((input: string | URL | Request) => {
        const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
        const payload = url.includes("/api/settings/teams-alert/history")
          ? {
              items: [],
              page: 1,
              pageSize: 5,
              totalItems: 0,
              totalPages: 1
            }
          : url.includes("/api/settings/account")
          ? {
              themeMode: "dark"
            }
          : {
              enabled: false,
              destinationLabel: null,
              triggerAmountUsd: 1000,
              hasWebhookUrl: false,
              webhookUrl: null,
              baselineValue: null,
              lastEvaluatedAt: null,
              lastDeliveredAt: null,
              lastFailureAt: null,
              lastFailureMessage: null,
              deliveryStatus: "idle"
            };

        return Promise.resolve(
          new Response(JSON.stringify(payload), {
            status: 200,
            headers: {
              "Content-Type": "application/json"
            }
          })
        );
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("exposes the settings surface and dark mode toggle", async () => {
    render(<SettingsPage initialThemeMode="light" isAuthenticated={false} />);

    expect(screen.getByRole("heading", { name: "Settings" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Appearance" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Dark mode toggle" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Alerts" })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole("link", { name: "Sign In To Sync Appearance" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Sign In To Manage Alerts" })).toBeInTheDocument();
    });
  });
});
