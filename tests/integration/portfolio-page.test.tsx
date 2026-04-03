import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PortfolioPage from "@/app/portfolio/page";

describe("portfolio page", () => {
  it("shows portfolio value content", async () => {
    const page = await PortfolioPage();
    render(page);

    expect(screen.getByText("My Portfolio")).toBeInTheDocument();
  });
});
