import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDemoUserState, resetDemoStore } from "@/lib/db/demo-store";
import PortfolioPage from "@/app/portfolio/page";

vi.mock("next/navigation", () => ({
  usePathname: () => "/portfolio",
  useRouter: () => ({
    push: vi.fn()
  }),
  useSearchParams: () => new URLSearchParams()
}));

describe("portfolio page", () => {
  beforeEach(() => {
    resetDemoStore();
  });

  it("shows portfolio profit/loss content", async () => {
    const page = await PortfolioPage({
      searchParams: Promise.resolve({})
    });
    render(page);

    expect(screen.getByText("My Portfolio")).toBeInTheDocument();
    expect(screen.getByText("Profit / loss")).toBeInTheDocument();
    expect(screen.getByText("Compared with your first valuation snapshot today.")).toBeInTheDocument();
  });

  it("disables export when the portfolio is empty", async () => {
    const page = await PortfolioPage({
      searchParams: Promise.resolve({})
    });
    render(page);

    expect(screen.getByRole("button", { name: "Export Portfolio" })).toBeDisabled();
    expect(screen.getByText("Add a holding to enable spreadsheet export.")).toBeInTheDocument();
  });

  it("enables export when the portfolio has holdings", async () => {
    getDemoUserState("demo-user").holdings.push({
      id: "holding-1",
      cardVariationId: "sv1-charizard-ex-en-nm-holo",
      quantity: 1,
      createdAt: "2026-04-02T08:00:00.000Z"
    });

    const page = await PortfolioPage({
      searchParams: Promise.resolve({})
    });
    render(page);

    expect(screen.getByRole("button", { name: "Export Portfolio" })).toBeEnabled();
  });
});
