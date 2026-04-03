import type { DemoCard } from "@/lib/db/demo-data";
import { selectPreferredVariation } from "@/lib/tcgtracking/select-preferred-variation";

export type CardListItem = {
  id: string;
  category: string;
  categoryName: string;
  setName: string;
  name: string;
  collectorNumber?: string;
  rarity?: string;
  imageUrl?: string;
  currentPrice?: number;
  variationCount: number;
};

export function toCardListItem(card: DemoCard): CardListItem {
  const preferredVariation = selectPreferredVariation(card.variations);

  return {
    id: card.id,
    category: card.category,
    categoryName: card.categoryName,
    setName: card.setName,
    name: card.name,
    collectorNumber: card.collectorNumber,
    rarity: card.rarity,
    imageUrl: card.imageUrl,
    currentPrice: preferredVariation?.currentPrice,
    variationCount: card.variations.length
  };
}
