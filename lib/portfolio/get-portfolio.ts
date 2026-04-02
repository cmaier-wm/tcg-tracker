import { getDemoCards, getDemoStore } from "@/lib/db/demo-store";
import { valuePortfolio } from "@/lib/portfolio/value-portfolio";

export async function getPortfolio() {
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

