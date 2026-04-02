import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CardsPage from "@/app/cards/page";

describe("cards page", () => {
  it("renders catalog heading", async () => {
    const page = await CardsPage({ searchParams: Promise.resolve({}) });
    render(page);

    expect(screen.getByText("Cards and variants")).toBeInTheDocument();
  });
});

