import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CardDetailPage from "@/app/cards/[category]/[cardId]/page";

vi.mock("@/lib/pricing/get-price-history", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/pricing/get-price-history")>();

  return {
    ...actual,
    getPriceHistory: vi.fn().mockResolvedValue({ variationId: "variation-1", points: [] })
  };
});

describe("card detail page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a selected card", async () => {
    const page = await CardDetailPage({
      params: Promise.resolve({ category: "pokemon", cardId: "sv1-charizard-ex" })
    });

    render(page);

    expect(screen.getByRole("heading", { level: 1, name: "Charizard ex" })).toBeInTheDocument();
    expect(screen.getByLabelText("Quantity")).toHaveValue(1);
    expect(screen.getByRole("button", { name: "Save Holding" })).toBeInTheDocument();
  });

  it("renders the no-history empty state when there are fewer than two points", async () => {
    const page = await CardDetailPage({
      params: Promise.resolve({ category: "pokemon", cardId: "sv1-charizard-ex" })
    });

    render(page);

    expect(
      screen.getByText(
        "Historical pricing will appear after more than one price snapshot has been recorded."
      )
    ).toBeInTheDocument();
  });
});
