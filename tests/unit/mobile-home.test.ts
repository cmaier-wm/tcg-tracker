import { beforeEach, describe, expect, it, vi } from "vitest";
import { getMobileHome } from "@/lib/mobile/get-mobile-home";

const authMocks = vi.hoisted(() => ({
  requireAuthenticatedUser: vi.fn()
}));

const portfolioMocks = vi.hoisted(() => ({
  getPortfolio: vi.fn(),
  getPortfolioHistory: vi.fn()
}));

vi.mock("@/lib/auth/auth-session", () => authMocks);
vi.mock("@/lib/portfolio/get-portfolio", () => ({
  getPortfolio: portfolioMocks.getPortfolio
}));
vi.mock("@/lib/portfolio/get-portfolio-history", () => ({
  getPortfolioHistory: portfolioMocks.getPortfolioHistory
}));

describe("mobile home summary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requireAuthenticatedUser.mockResolvedValue({
      userId: "user-1",
      email: "collector@example.com",
      displayName: "Collector"
    });
  });

  it("derives aggregate quantity and empty state from the portfolio payload", async () => {
    portfolioMocks.getPortfolio.mockResolvedValue({
      holdings: [{ quantity: 2 }, { quantity: 3 }],
      totalEstimatedValue: 200,
      holdingCount: 2
    });
    portfolioMocks.getPortfolioHistory.mockResolvedValue({
      points: [
        { capturedAt: "2026-04-10T00:00:00.000Z", totalValue: 180 },
        { capturedAt: "2026-04-10T12:00:00.000Z", totalValue: 200 }
      ]
    });

    const summary = await getMobileHome();

    expect(summary.totalCardQuantity).toBe(5);
    expect(summary.emptyState).toBe(false);
    expect(summary.todayProfitLoss).toBe(20);
  });
});
