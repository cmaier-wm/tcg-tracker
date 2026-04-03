import React from "react";
import { CardsBrowserPage } from "@/components/cards/cards-browser-page";
import { getCatalogCategories } from "@/lib/tcgtracking/get-categories";
import { getCatalogSets } from "@/lib/tcgtracking/get-sets";
import { getCardCatalog } from "@/lib/tcgtracking/get-card-catalog";

const INITIAL_PAGE_SIZE = 20;
const POKEMON_CATEGORY = "pokemon";

export default async function CardsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; category?: string; set?: string }>;
}) {
  const params = await searchParams;
  const selectedCategory = POKEMON_CATEGORY;
  const selectedSet = params.set?.trim() || undefined;
  const [items, categories, sets] = await Promise.all([
    getCardCatalog({
      q: params.q,
      category: selectedCategory,
      set: selectedSet,
      limit: INITIAL_PAGE_SIZE
    }),
    getCatalogCategories(),
    getCatalogSets(selectedCategory)
  ]);

  return (
    <CardsBrowserPage
      query={params.q}
      selectedCategory={selectedCategory}
      selectedSet={selectedSet}
      items={items}
      categories={categories.filter((category) => category.slug === POKEMON_CATEGORY)}
      sets={sets}
      resetHref="/cards"
    />
  );
}
