import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PortfolioPage from "@/app/portfolio/page";

describe("portfolio page", () => {
  it("shows portfolio profit/loss content", async () => {
    const page = await PortfolioPage();
    render(page);

    expect(screen.getByText("My Portfolio")).toBeInTheDocument();
    expect(screen.getByText("Profit / loss")).toBeInTheDocument();
    expect(screen.getByText("Compared with your first valuation snapshot today.")).toBeInTheDocument();
  });
});
