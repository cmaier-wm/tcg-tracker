import { getDemoStore } from "@/lib/db/demo-store";

export async function getPortfolioHistory() {
  const store = getDemoStore();

  return {
    points: store.portfolioHistory.map((point) => ({
      capturedAt: point.capturedAt,
      totalValue: point.marketPrice
    }))
  };
}

