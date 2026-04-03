import { withDatabaseFallback } from "@/lib/db/runtime";
import { getDemoStore } from "@/lib/db/demo-store";
import { getDatabasePortfolioHistory } from "@/lib/portfolio/db-portfolio";

export async function getPortfolioHistory() {
  return withDatabaseFallback(
    async () => {
      const points = await getDatabasePortfolioHistory();

      return {
        points: points.map((point) => ({
          capturedAt: point.capturedAt.toISOString(),
          totalValue: point.totalValue
        }))
      };
    },
    async () => {
      const store = getDemoStore();

      return {
        points: store.portfolioHistory.map((point) => ({
          capturedAt: point.capturedAt,
          totalValue: point.marketPrice
        }))
      };
    }
  );
}
