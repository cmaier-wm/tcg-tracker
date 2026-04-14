import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CardDetailPage from "@/app/cards/[category]/[cardId]/page";

describe("card pricing section", () => {
  it("shows current pricing content", async () => {
    const page = await CardDetailPage({
      params: Promise.resolve({ category: "pokemon", cardId: "sv1-charizard-ex" }),
      searchParams: Promise.resolve({})
    });

    render(page);

    expect(screen.getByText("Current price")).toBeInTheDocument();
    expect(screen.getByText("Price History")).toBeInTheDocument();
  });
});
