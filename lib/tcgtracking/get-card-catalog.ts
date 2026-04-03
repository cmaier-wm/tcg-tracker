import { withDatabaseFallback } from "@/lib/db/runtime";
import { getDemoCards } from "@/lib/db/demo-store";
import { getDatabaseCardCatalog } from "@/lib/tcgtracking/db-catalog";
import { toCardListItem } from "@/lib/tcgtracking/mappers";

type CatalogOptions = {
  q?: string | null;
  category?: string | null;
  set?: string | null;
  limit?: number;
  offset?: number;
};

function normalizeFilter(value?: string | null) {
  const normalized = value?.trim().toLowerCase();
  return normalized ? normalized : undefined;
}

export async function getCardCatalog(options: CatalogOptions = {}) {
  const query = normalizeFilter(options.q);
  const category = normalizeFilter(options.category);
  const set = normalizeFilter(options.set);
  const limit = options.limit;
  const offset = options.offset ?? 0;

  return withDatabaseFallback(
    async () => {
      const cards = await getDatabaseCardCatalog({
        q: query,
        category,
        set,
        limit,
        offset
      });

      return cards.map((card) => ({
        id: card.id,
        category: card.set.category.slug,
        categoryName: card.set.category.name,
        setName: card.set.name,
        name: card.name,
        collectorNumber: card.collectorNumber ?? undefined,
        rarity: card.rarity ?? undefined,
        imageUrl: card.imageUrl ?? undefined,
        currentPrice: card.variations[0]?.priceSnapshots[0]?.marketPrice ?? undefined,
        variationCount: card.variations.length
      }));
    },
    async () =>
      getDemoCards()
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

          if (
            set &&
            card.setName
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, "") !== set
          ) {
            return false;
          }

          return true;
        })
        .map(toCardListItem)
        .slice(offset, limit ? offset + limit : undefined)
  );
}
