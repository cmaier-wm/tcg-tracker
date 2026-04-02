import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CardDetailPage from "@/app/cards/[category]/[cardId]/page";

describe("card detail page", () => {
  it("renders a selected card", async () => {
    const page = await CardDetailPage({
      params: Promise.resolve({ category: "pokemon", cardId: "sv1-charizard-ex" })
    });

    render(page);

    expect(screen.getByText("Charizard ex")).toBeInTheDocument();
    expect(screen.getByText("Add to portfolio")).toBeInTheDocument();
  });
});

