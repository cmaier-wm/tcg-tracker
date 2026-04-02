import { notFound } from "@/lib/api/http-errors";
import { getDemoCards } from "@/lib/db/demo-store";

export async function getCardDetail(category: string, cardId: string) {
  const card = getDemoCards().find(
    (item) => item.category === category && item.id === cardId
  );

  if (!card) {
    throw notFound("Card not found");
  }

  return {
    id: card.id,
    category: card.category,
    categoryName: card.categoryName,
    setName: card.setName,
    name: card.name,
    collectorNumber: card.collectorNumber,
    rarity: card.rarity,
    imageUrl: card.imageUrl,
    variations: card.variations.map((variation) => ({
      id: variation.id,
      label: variation.label,
      languageCode: variation.languageCode,
      finish: variation.finish,
      conditionCode: variation.conditionCode,
      currentPrice: variation.currentPrice,
      lastUpdatedAt: variation.lastUpdatedAt
    }))
  };
}

