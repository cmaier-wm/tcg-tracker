import { getDemoStore } from "@/lib/db/demo-store";
import { valuePortfolio } from "@/lib/portfolio/value-portfolio";

export async function saveValuationSnapshot() {
  const store = getDemoStore();
  const valuation = valuePortfolio(store.holdings);
  const snapshot = {
    capturedAt: new Date().toISOString(),
    totalValue: valuation.totalEstimatedValue,
    holdingCount: valuation.holdingCount,
    pricedHoldingCount: valuation.pricedHoldingCount
  };

  store.portfolioHistory.push({
    capturedAt: snapshot.capturedAt,
    marketPrice: snapshot.totalValue
  });

  return { snapshot, history: store.portfolioHistory };
}
