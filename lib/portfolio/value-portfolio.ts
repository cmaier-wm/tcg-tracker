import { demoCards, demoPortfolio } from "@/lib/db/demo-data";

export type ValuedHolding = {
  id: string;
  cardVariationId: string;
  cardName: string;
  variationLabel: string;
  quantity: number;
  estimatedValue: number;
};

export function valuePortfolio(
  holdings: Array<{ id: string; cardVariationId: string; quantity: number }> = demoPortfolio
) {
  const allVariations = demoCards.flatMap((card) =>
    card.variations.map((variation) => ({
      ...variation,
      cardName: card.name,
      imageUrl: card.imageUrl
    }))
  );

  const valuedHoldings: ValuedHolding[] = holdings.map((holding) => {
    const variation = allVariations.find((item) => item.id === holding.cardVariationId);
    const estimatedValue = (variation?.currentPrice ?? 0) * holding.quantity;

    return {
      id: holding.id,
      cardVariationId: holding.cardVariationId,
      cardName: variation?.cardName ?? "Unknown card",
      variationLabel: variation?.label ?? "Unknown variation",
      quantity: holding.quantity,
      estimatedValue
    };
  });

  const totalEstimatedValue = valuedHoldings.reduce(
    (total, holding) => total + holding.estimatedValue,
    0
  );

  return {
    holdings: valuedHoldings,
    totalEstimatedValue,
    holdingCount: valuedHoldings.length,
    pricedHoldingCount: valuedHoldings.filter((holding) => holding.estimatedValue > 0).length
  };
}
