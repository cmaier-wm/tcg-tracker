import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PortfolioList } from "@/components/portfolio/portfolio-list";

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

describe("portfolio list", () => {
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
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("shows a full-screen celebration after a quantity change succeeds", async () => {
    const user = userEvent.setup();

    render(
      <PortfolioList
        holdings={[
          {
            id: "holding-1",
            cardVariationId: "charizard",
            cardName: "Charizard ex",
            variationLabel: "English",
            quantity: 1,
            estimatedValue: 120.5,
            cardId: null,
            category: null,
            imageUrl: null
          }
        ]}
      />
    );

    const input = screen.getByLabelText("Quantity");

    await user.clear(input);
    await user.type(input, "4");

    await waitFor(() => {
      expect(screen.getByRole("status", { name: /quantity updated for charizard ex/i })).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.queryByRole("status", { name: /quantity updated for charizard ex/i })).not.toBeInTheDocument();
    }, { timeout: 3800 });
  });
});
