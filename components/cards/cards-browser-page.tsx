import React from "react";
import { CatalogFilters } from "@/components/cards/catalog-filters";
import { CardEmptyState } from "@/components/cards/card-empty-state";
import { InfiniteCardList } from "@/components/cards/infinite-card-list";
import type { CatalogCategory } from "@/lib/tcgtracking/get-categories";
import type { CatalogSet } from "@/lib/tcgtracking/get-sets";
import type { CardListItem } from "@/lib/tcgtracking/mappers";
import type {
  CatalogProductTypeValue,
  CatalogSortValue
} from "@/lib/tcgtracking/search-query";

const PAGE_SIZE = 20;

type CardsBrowserPageProps = {
  query?: string;
  selectedCategory?: string;
  selectedSet?: string;
  selectedSort: CatalogSortValue;
  selectedProductType?: CatalogProductTypeValue;
  items: CardListItem[];
  categories: CatalogCategory[];
  sets: CatalogSet[];
  resetHref: string;
  showProductTypeFilter?: boolean;
};

export function CardsBrowserPage({
  query,
  selectedCategory,
  selectedSet,
  selectedSort,
  selectedProductType = "card",
  items,
  categories,
  sets,
  resetHref,
  showProductTypeFilter = false
}: CardsBrowserPageProps) {
  const stateKey = [
    query ?? "",
    selectedCategory ?? "",
    selectedSet ?? "",
    selectedSort,
    selectedProductType
  ].join(":");
  const emptyTypeLabel =
    selectedProductType === "card" ? "cards" : "sealed products";

  return (
    <div className="page-grid">
      <section className="page-intro stack">
        <div className="stack">
          <h1>Pokémon Card Browser</h1>
          <p className="hero-copy">
            Search and explore English Pokémon cards with current pricing and portfolio tracking.
          </p>
        </div>
      </section>
      <CatalogFilters
        key={`filters:${stateKey}`}
        query={query}
        selectedSet={selectedSet}
        selectedSort={selectedSort}
        selectedProductType={selectedProductType}
        categories={categories}
        sets={sets}
        resetHref={resetHref}
        showProductTypeFilter={showProductTypeFilter}
      />
      {items.length ? (
        <InfiniteCardList
          key={`results:${stateKey}`}
          initialItems={items}
          query={query}
          selectedCategory={selectedCategory}
          selectedSet={selectedSet}
          selectedSort={selectedSort}
          selectedProductType={selectedProductType}
          pageSize={PAGE_SIZE}
        />
      ) : (
        <CardEmptyState
          title={`No ${emptyTypeLabel} found`}
          body={`Try a different search term or adjust the set, sort, or type filters for ${emptyTypeLabel}.`}
        />
      )}
    </div>
  );
}
