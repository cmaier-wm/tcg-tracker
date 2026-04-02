import type { DemoCard } from "@/lib/db/demo-data";

export type CardListItem = {
  id: string;
  category: string;
  categoryName: string;
  setName: string;
  name: string;
  collectorNumber?: string;
  rarity?: string;
  imageUrl?: string;
};

export function toCardListItem(card: DemoCard): CardListItem {
  return {
    id: card.id,
    category: card.category,
    categoryName: card.categoryName,
    setName: card.setName,
    name: card.name,
    collectorNumber: card.collectorNumber,
    rarity: card.rarity,
    imageUrl: card.imageUrl
  };
}

