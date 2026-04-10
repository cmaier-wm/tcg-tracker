import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { PortfolioExportButton } from "@/components/portfolio/portfolio-export-button";

const { mockPush } = vi.hoisted(() => ({
  mockPush: vi.fn()
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush
  }),
  useSearchParams: () => new URLSearchParams("sort=name-asc")
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe("portfolio export button", () => {
  const originalCreateObjectUrl = URL.createObjectURL;
  const originalRevokeObjectUrl = URL.revokeObjectURL;

  beforeEach(() => {
    mockPush.mockReset();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(new Uint8Array([0x50, 0x4b, 0x03, 0x04]), {
          status: 200,
          headers: {
            "Content-Disposition": 'attachment; filename="portfolio-export-2026-04-10.xlsx"',
            "Content-Type":
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          }
        })
      )
    );
    URL.createObjectURL = vi.fn(() => "blob:portfolio-export");
    URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    window.history.replaceState({}, "", "/portfolio?sort=name-asc");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    URL.createObjectURL = originalCreateObjectUrl;
    URL.revokeObjectURL = originalRevokeObjectUrl;
  });

  it("downloads the export file and surfaces success feedback", async () => {
    const user = userEvent.setup();

    render(<PortfolioExportButton disabled={false} />);

    await user.click(screen.getByRole("button", { name: "Export Portfolio" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/portfolio/export?sort=name-asc");
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Portfolio export downloaded.");
    });
  });

  it("redirects to login when export authentication fails", async () => {
    const user = userEvent.setup();

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "Authentication is required." }), {
          status: 401,
          headers: {
            "Content-Type": "application/json"
          }
        })
      )
    );

    render(<PortfolioExportButton disabled={false} />);

    await user.click(screen.getByRole("button", { name: "Export Portfolio" }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login?returnTo=%2Fportfolio%3Fsort%3Dname-asc");
    });
  });

  it("surfaces the empty-state message from the route", async () => {
    const user = userEvent.setup();

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: "No portfolio data available to export.",
            code: "portfolio_empty"
          }),
          {
            status: 409,
            headers: {
              "Content-Type": "application/json"
            }
          }
        )
      )
    );

    render(<PortfolioExportButton disabled={false} />);

    await user.click(screen.getByRole("button", { name: "Export Portfolio" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("No portfolio data available to export.");
    });
  });

  it("shows helper text and disables export when there are no holdings", () => {
    render(<PortfolioExportButton disabled={true} />);

    expect(screen.getByRole("button", { name: "Export Portfolio" })).toBeDisabled();
    expect(screen.getByText("Add a holding to enable spreadsheet export.")).toBeInTheDocument();
  });
});
