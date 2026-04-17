import type { DemoCard } from "@/lib/db/demo-data";
import { selectPreferredVariation } from "@/lib/tcgtracking/select-preferred-variation";
import type { CatalogProductTypeValue } from "@/lib/tcgtracking/search-query";

export type CardListItem = {
  id: string;
  productType: CatalogProductTypeValue;
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
    productType: card.productType ?? "card",
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
