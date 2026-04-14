import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { SettingsPage } from "@/components/settings/settings-page";
import { clearStoredThemeMode, readStoredThemeMode } from "@/lib/settings/theme-storage";

const originalFetch = global.fetch;

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

function createSettingsResponse(overrides?: Partial<Record<string, unknown>>) {
  return {
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
    deliveryStatus: "idle",
    ...overrides
  };
}

function createHistoryResponse(overrides?: Partial<Record<string, unknown>>) {
  return {
    items: [],
    page: 1,
    pageSize: 5,
    totalItems: 0,
    totalPages: 1,
    ...overrides
  };
}

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation((input: string | URL | Request) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      const payload = url.includes("/api/settings/teams-alert/history")
        ? createHistoryResponse()
        : createSettingsResponse();

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
  clearStoredThemeMode();
  document.documentElement.dataset.theme = "";
  document.documentElement.style.colorScheme = "";
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  global.fetch = originalFetch;
});

describe("settings page", () => {
  it("renders the settings area and toggles dark mode", async () => {
    const user = userEvent.setup();

    render(<SettingsPage initialThemeMode="light" isAuthenticated={false} />);

    expect(screen.getByRole("heading", { name: "Settings" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Appearance" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Dark mode toggle" })).toBeInTheDocument();
    expect(screen.getByText("Sign in to manage account-backed Teams alerts. Theme preferences stay available on this device even when signed out.")).toBeInTheDocument();

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe("light");
    });

    await user.click(screen.getByRole("checkbox", { name: "Dark mode toggle" }));

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe("dark");
      expect(readStoredThemeMode()).toBe("dark");
    });
  });

  it("loads and saves Teams alert settings", async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify(createSettingsResponse()), {
          status: 200,
          headers: {
            "Content-Type": "application/json"
          }
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(createHistoryResponse()), {
          status: 200,
          headers: {
            "Content-Type": "application/json"
          }
        })
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify(
            createSettingsResponse({
              enabled: true,
              destinationLabel: "Trading alerts",
              triggerAmountUsd: 1500,
              hasWebhookUrl: true,
              webhookUrl: "https://example.com/workflows/hook",
              baselineValue: 0
            })
          ),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json"
            }
          }
        )
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(createHistoryResponse()), {
          status: 200,
          headers: {
            "Content-Type": "application/json"
          }
        })
      );

    vi.stubGlobal("fetch", fetchMock);

    render(<SettingsPage initialThemeMode="light" isAuthenticated={true} />);

    await waitFor(() => {
      expect(screen.getByLabelText("Teams Workflow Webhook URL")).toHaveValue("");
    });

    await user.type(screen.getByLabelText("Destination Label"), "Trading alerts");
    await user.clear(screen.getByLabelText("Alert Trigger Amount (USD)"));
    await user.type(screen.getByLabelText("Alert Trigger Amount (USD)"), "1500");
    await user.type(
      screen.getByLabelText("Teams Workflow Webhook URL"),
      "https://example.com/workflows/hook"
    );
    await user.click(screen.getByRole("checkbox", { name: "Teams alerts toggle" }));
    await user.click(screen.getByRole("button", { name: "Save Teams Alerts" }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Teams alerts saved.");
    });

    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it("prefills an existing Teams webhook URL", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify(
            createSettingsResponse({
              enabled: true,
              destinationLabel: "Trading alerts",
              triggerAmountUsd: 1500,
              hasWebhookUrl: true,
              webhookUrl: "https://example.com/workflows/existing-hook"
            })
          ),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json"
            }
          }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify(
            createHistoryResponse({
              items: [
                {
                  id: "delivery-1",
                  capturedAt: "2026-04-07T18:30:00.000Z",
                  portfolioValue: 2400,
                  baselineValue: 1200,
                  gainAmount: 1200,
                  status: "sent",
                  responseCode: 202,
                  failureMessage: null
                }
              ]
            })
          ),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json"
            }
          }
        )
      );

    vi.stubGlobal("fetch", fetchMock);

    render(<SettingsPage initialThemeMode="light" isAuthenticated={true} />);

    await waitFor(() => {
      expect(screen.getByLabelText("Teams Workflow Webhook URL")).toHaveValue(
        "https://example.com/workflows/existing-hook"
      );
      expect(screen.getByLabelText("Alert Trigger Amount (USD)")).toHaveValue(1500);
      expect(screen.getByText("Webhook History")).toBeInTheDocument();
    });
  });
});
