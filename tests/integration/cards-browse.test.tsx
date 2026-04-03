import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CardsPage from "@/app/cards/page";

describe("cards page", () => {
  it("renders catalog heading", async () => {
    const page = await CardsPage({ searchParams: Promise.resolve({}) });
    render(page);

    expect(screen.getByText("TCG Card Browser")).toBeInTheDocument();
    expect(screen.getByLabelText("Search cards")).toBeInTheDocument();
    expect(screen.getByLabelText("Game category")).toBeInTheDocument();
    expect(screen.getByLabelText("Set")).toBeInTheDocument();
  });
});
