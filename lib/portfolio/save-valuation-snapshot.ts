import { prisma } from "@/lib/db/prisma";
import { withDatabaseFallback } from "@/lib/db/runtime";
import { getDemoUserState } from "@/lib/db/demo-store";
import { requireAuthenticatedUser } from "@/lib/auth/auth-session";
import { valuePortfolio } from "@/lib/portfolio/value-portfolio";
import { evaluatePortfolioAlert } from "@/lib/teams/evaluate-portfolio-alert";

export async function saveValuationSnapshot(userId?: string) {
  return withDatabaseFallback(
    async () => {
      const user = userId
        ? { userId }
        : await requireAuthenticatedUser();
      const holdings = await prisma.portfolioHolding.findMany({
        where: { userId: user.userId },
        include: {
          variation: {
            include: {
              priceSnapshots: {
                orderBy: { capturedAt: "desc" },
                take: 1
              }
            }
          }
        }
      });

      const totalValue = holdings.reduce(
        (sum, holding) =>
          sum + (holding.variation.priceSnapshots[0]?.marketPrice ?? 0) * holding.quantity,
        0
      );
      const snapshotDate = new Date();
      snapshotDate.setMilliseconds(0);

      const snapshot = await prisma.portfolioValuationSnapshot.upsert({
        where: {
          userId_capturedAt: {
            userId: user.userId,
            capturedAt: snapshotDate
          }
        },
        update: {
          totalValue,
          holdingCount: holdings.length,
          pricedHoldingCount: holdings.filter(
            (holding) => holding.variation.priceSnapshots[0]?.marketPrice != null
          ).length
        },
        create: {
          userId: user.userId,
          capturedAt: snapshotDate,
          totalValue,
          holdingCount: holdings.length,
          pricedHoldingCount: holdings.filter(
            (holding) => holding.variation.priceSnapshots[0]?.marketPrice != null
          ).length
        }
      });

      const history = await prisma.portfolioValuationSnapshot.findMany({
        where: { userId: user.userId },
        orderBy: { capturedAt: "asc" }
      });
      const alert = await evaluatePortfolioAlert({
        capturedAt: snapshot.capturedAt.toISOString(),
        portfolioValue: snapshot.totalValue
      });

      return {
        snapshot: {
          capturedAt: snapshot.capturedAt.toISOString(),
          totalValue: snapshot.totalValue,
          holdingCount: snapshot.holdingCount,
          pricedHoldingCount: snapshot.pricedHoldingCount
        },
        history: history.map((item) => ({
          capturedAt: item.capturedAt.toISOString(),
          marketPrice: item.totalValue
        })),
        alert
      };
    },
    async () => {
      const resolvedUserId = userId ?? (await requireAuthenticatedUser()).userId;
      const store = getDemoUserState(resolvedUserId);
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

      const alert = await evaluatePortfolioAlert({
        capturedAt: snapshot.capturedAt,
        portfolioValue: snapshot.totalValue
      });

      return { snapshot, history: store.portfolioHistory, alert };
    }
  );
}
