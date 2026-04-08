import { withDatabaseFallback } from "@/lib/db/runtime";
import { getDemoUserState } from "@/lib/db/demo-store";
import { requireAuthenticatedUser } from "@/lib/auth/auth-session";
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
      const user = await requireAuthenticatedUser();
      const store = getDemoUserState(user.userId);

      return {
        points: store.portfolioHistory.map((point) => ({
          capturedAt: point.capturedAt,
          totalValue: point.marketPrice
        }))
      };
    }
  );
}
