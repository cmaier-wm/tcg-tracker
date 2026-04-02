import { getDemoCards } from "@/lib/db/demo-store";
import { toCardListItem } from "@/lib/tcgtracking/mappers";

type CatalogOptions = {
  q?: string | null;
  category?: string | null;
  set?: string | null;
};

export async function getCardCatalog(options: CatalogOptions = {}) {
  const query = options.q?.trim().toLowerCase();
  const category = options.category?.trim().toLowerCase();
  const set = options.set?.trim().toLowerCase();

  return getDemoCards()
    .filter((card) => {
      if (query) {
        const haystack = `${card.name} ${card.setName} ${card.collectorNumber ?? ""}`.toLowerCase();
        if (!haystack.includes(query)) {
          return false;
        }
      }

      if (category && card.category !== category) {
        return false;
      }

      if (set && card.setName.toLowerCase() !== set) {
        return false;
      }

      return true;
    })
    .map(toCardListItem);
}

