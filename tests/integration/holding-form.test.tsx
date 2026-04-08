import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HoldingForm } from "@/components/portfolio/holding-form";

const { mockRefresh, mockPush } = vi.hoisted(() => ({
  mockRefresh: vi.fn(),
  mockPush: vi.fn()
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mockRefresh,
    push: mockPush
  })
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe("holding form", () => {
  beforeEach(() => {
    mockRefresh.mockReset();
    mockPush.mockReset();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(null, {
          status: 204
        })
      )
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("requires confirmation before deleting a holding", async () => {
    const user = userEvent.setup();

    render(
      <HoldingForm
        holdingId="holding-1"
        quantity={1}
        cardName="Charizard ex"
        variationLabel="English"
        compact
      />
    );

    await user.click(screen.getByRole("button", { name: "Remove holding" }));

    expect(screen.getByRole("dialog", { name: "Remove this holding?" })).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("dialog", { name: "Remove this holding?" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Remove holding" }));
    await user.click(screen.getByRole("button", { name: "Delete Holding" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/portfolio/holding-1", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        }
      });
      expect(mockRefresh).toHaveBeenCalled();
    });
  });
});
