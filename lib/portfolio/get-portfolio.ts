import { withDatabaseFallback } from "@/lib/db/runtime";
import { getDemoCards, getDemoStore } from "@/lib/db/demo-store";
import { getDatabasePortfolio } from "@/lib/portfolio/db-portfolio";
import { valuePortfolio } from "@/lib/portfolio/value-portfolio";

export async function getPortfolio() {
  return withDatabaseFallback(
    async () => {
      const holdings = await getDatabasePortfolio();
      const mapped = holdings.map((holding) => {
        const estimatedValue =
          (holding.variation.priceSnapshots[0]?.marketPrice ?? 0) * holding.quantity;

        return {
          id: holding.id,
          cardVariationId: holding.cardVariationId,
          cardName: holding.variation.card.name,
          variationLabel: holding.variation.variantLabel,
          quantity: holding.quantity,
          estimatedValue,
          cardId: holding.variation.card.id,
          category: holding.variation.card.set.category.slug,
          imageUrl: holding.variation.card.imageUrl
        };
      });

      return {
        holdings: mapped,
        totalEstimatedValue: mapped.reduce(
          (total, holding) => total + holding.estimatedValue,
          0
        ),
        holdingCount: mapped.length
      };
    },
    async () => {
      const store = getDemoStore();
      const valuation = valuePortfolio(store.holdings);
      const cardsByVariation = new Map(
        getDemoCards().flatMap((card) =>
          card.variations.map((variation) => [
            variation.id,
            {
              cardId: card.id,
              cardName: card.name,
              category: card.category,
              imageUrl: card.imageUrl
            }
          ])
        )
      );

      return {
        holdings: valuation.holdings.map((holding) => ({
          ...holding,
          cardId: cardsByVariation.get(holding.cardVariationId)?.cardId ?? null,
          category: cardsByVariation.get(holding.cardVariationId)?.category ?? null,
          imageUrl: cardsByVariation.get(holding.cardVariationId)?.imageUrl ?? null
        })),
        totalEstimatedValue: valuation.totalEstimatedValue,
        holdingCount: valuation.holdingCount
      };
    }
  );
}
