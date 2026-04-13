import { unstable_cache } from "next/cache";
import { withDatabaseFallback } from "@/lib/db/runtime";
import { getDemoCards } from "@/lib/db/demo-store";
import { getDatabaseCardCatalog } from "@/lib/tcgtracking/db-catalog";
import { toCardListItem } from "@/lib/tcgtracking/mappers";
import {
  matchesSearchTokens,
  normalizeCatalogSort,
  sortCardListItems,
  tokenizeSearchQuery
} from "@/lib/tcgtracking/search-query";

type CatalogOptions = {
  q?: string | null;
  category?: string | null;
  set?: string | null;
  sort?: string | null;
  limit?: number;
  offset?: number;
};

const getCachedDatabaseCardCatalog = unstable_cache(
  async (options: CatalogOptions) => getDatabaseCardCatalog(options),
  ["db-card-catalog"],
  { revalidate: 60 }
);

function normalizeFilter(value?: string | null) {
  const normalized = value?.trim().toLowerCase();
  return normalized ? normalized : undefined;
}

export async function getCardCatalog(options: CatalogOptions = {}) {
  const searchTokens = tokenizeSearchQuery(options.q);
  const category = normalizeFilter(options.category);
  const set = normalizeFilter(options.set);
  const sort = normalizeCatalogSort(options.sort);
  const limit = options.limit;
  const offset = options.offset ?? 0;

  return withDatabaseFallback(
    async () => {
      const cards = await getCachedDatabaseCardCatalog({
        q: options.q,
        category,
        set,
        sort,
        limit,
        offset
      });

      return cards.map((card) => ({
          ...card,
          collectorNumber: card.collectorNumber ?? undefined,
          rarity: card.rarity ?? undefined,
          imageUrl: card.imageUrl ?? undefined,
          currentPrice: card.currentPrice ?? undefined
        }));
    },
    async () =>
      sortCardListItems(
        getDemoCards()
          .filter((card) => {
            if (
              searchTokens.length &&
              !matchesSearchTokens(
                [card.name, card.setName, card.collectorNumber ?? ""],
                searchTokens
              )
            ) {
              return false;
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
          .map(toCardListItem),
        sort
      )
        .slice(offset, limit ? offset + limit : undefined)
  );
}
