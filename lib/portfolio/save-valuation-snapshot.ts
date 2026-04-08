import { prisma } from "@/lib/db/prisma";
import { withDatabaseFallback } from "@/lib/db/runtime";
import { getDemoStore } from "@/lib/db/demo-store";
import { getOrCreateDefaultUser } from "@/lib/portfolio/db-portfolio";
import { valuePortfolio } from "@/lib/portfolio/value-portfolio";
import { evaluatePortfolioAlert } from "@/lib/teams/evaluate-portfolio-alert";

export async function saveValuationSnapshot() {
  return withDatabaseFallback(
    async () => {
      const user = await getOrCreateDefaultUser();
      const holdings = await prisma.portfolioHolding.findMany({
        where: { userId: user.id },
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
            userId: user.id,
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
          userId: user.id,
          capturedAt: snapshotDate,
          totalValue,
          holdingCount: holdings.length,
          pricedHoldingCount: holdings.filter(
            (holding) => holding.variation.priceSnapshots[0]?.marketPrice != null
          ).length
        }
      });

      const history = await prisma.portfolioValuationSnapshot.findMany({
        where: { userId: user.id },
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

      const alert = await evaluatePortfolioAlert({
        capturedAt: snapshot.capturedAt,
        portfolioValue: snapshot.totalValue
      });

      return { snapshot, history: store.portfolioHistory, alert };
    }
  );
}
