import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CardDetailPage from "@/app/cards/[category]/[cardId]/page";

describe("card detail page", () => {
  it("renders a selected card", async () => {
    const page = await CardDetailPage({
      params: Promise.resolve({ category: "pokemon", cardId: "sv1-charizard-ex" })
    });

    render(page);

    expect(screen.getByRole("heading", { level: 1, name: "Charizard ex" })).toBeInTheDocument();
    expect(screen.getByLabelText("Quantity")).toHaveValue(2);
    expect(screen.getByRole("button", { name: "Remove holding" })).toBeInTheDocument();
  });
});
