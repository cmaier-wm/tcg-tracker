import { demoCards } from "@/lib/db/demo-data";

export async function syncCatalog() {
  return {
    categories: Array.from(new Set(demoCards.map((card) => card.category))).length,
    cards: demoCards.length,
    variations: demoCards.flatMap((card) => card.variations).length
  };
}

