import { requireAuthenticatedUser } from "@/lib/auth/auth-session";
import { calculateTodayProfitLoss } from "@/lib/portfolio/calculate-today-profit-loss";
import { getPortfolio } from "@/lib/portfolio/get-portfolio";
import { getPortfolioHistory } from "@/lib/portfolio/get-portfolio-history";
import type { MobileHomeResponse } from "@/lib/mobile/types";

const mobileHistoryPreviewSize = 7;

export async function getMobileHome(): Promise<MobileHomeResponse> {
  const user = await requireAuthenticatedUser();
  const [portfolio, history] = await Promise.all([getPortfolio(), getPortfolioHistory()]);
  const totalCardQuantity = portfolio.holdings.reduce((sum, holding) => sum + holding.quantity, 0);

  return {
    displayName: user.displayName,
    totalEstimatedValue: portfolio.totalEstimatedValue,
    todayProfitLoss: calculateTodayProfitLoss(history.points),
    holdingCount: portfolio.holdingCount,
    totalCardQuantity,
    historyPreview: history.points.slice(-mobileHistoryPreviewSize),
    emptyState: portfolio.holdingCount === 0
  };
}
