import { badRequest, notFound } from "@/lib/api/http-errors";
import { getDemoCards, getDemoStore } from "@/lib/db/demo-store";
import { saveValuationSnapshot } from "@/lib/portfolio/save-valuation-snapshot";

export async function addHolding(cardVariationId: string, quantity: number) {
  if (quantity < 1) {
    throw badRequest("Quantity must be greater than zero");
  }

  const store = getDemoStore();
  const variationExists = getDemoCards()
    .flatMap((card) => card.variations)
    .some((variation) => variation.id === cardVariationId);

  if (!variationExists) {
    throw notFound("Card variation not found");
  }

  const existing = store.holdings.find((holding) => holding.cardVariationId === cardVariationId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    store.holdings.push({
      id: `holding-${Math.random().toString(36).slice(2, 9)}`,
      cardVariationId,
      quantity
    });
  }

  await saveValuationSnapshot();
  return store.holdings.find((holding) => holding.cardVariationId === cardVariationId);
}

