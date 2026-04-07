import React from "react";
import { CardsBrowserPage } from "@/components/cards/cards-browser-page";
import { getCardCatalog } from "@/lib/tcgtracking/get-card-catalog";
import { getCatalogCategories } from "@/lib/tcgtracking/get-categories";
import { getCatalogSets } from "@/lib/tcgtracking/get-sets";
import { normalizeCatalogSort } from "@/lib/tcgtracking/search-query";

export const dynamic = "force-dynamic";

const INITIAL_PAGE_SIZE = 20;
const POKEMON_CATEGORY = "pokemon";

export default async function HomePage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; category?: string; set?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() || undefined;
  const selectedCategory = POKEMON_CATEGORY;
  const selectedSet = params.set?.trim() || undefined;
  const selectedSort = normalizeCatalogSort(params.sort);

  const [items, categories, sets] = await Promise.all([
    getCardCatalog({
      q: query,
      category: selectedCategory,
      set: selectedSet,
      sort: selectedSort,
      limit: INITIAL_PAGE_SIZE
    }),
    getCatalogCategories(),
    getCatalogSets(selectedCategory)
  ]);

  return (
    <CardsBrowserPage
      query={query}
      selectedCategory={selectedCategory}
      selectedSet={selectedSet}
      selectedSort={selectedSort}
      items={items}
      categories={categories.filter((category) => category.slug === POKEMON_CATEGORY)}
      sets={sets}
      resetHref="/"
    />
  );
}
