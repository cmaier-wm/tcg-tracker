import React from "react";
import { CatalogFilters } from "@/components/cards/catalog-filters";
import { CardEmptyState } from "@/components/cards/card-empty-state";
import { InfiniteCardList } from "@/components/cards/infinite-card-list";
import type { CatalogCategory } from "@/lib/tcgtracking/get-categories";
import type { CatalogSet } from "@/lib/tcgtracking/get-sets";
import type { CardListItem } from "@/lib/tcgtracking/mappers";
import type { CatalogSortValue } from "@/lib/tcgtracking/search-query";

const PAGE_SIZE = 20;

type CardsBrowserPageProps = {
  query?: string;
  selectedCategory?: string;
  selectedSet?: string;
  selectedSort: CatalogSortValue;
  items: CardListItem[];
  categories: CatalogCategory[];
  sets: CatalogSet[];
  resetHref: string;
};

export function CardsBrowserPage({
  query,
  selectedCategory,
  selectedSet,
  selectedSort,
  items,
  categories,
  sets,
  resetHref
}: CardsBrowserPageProps) {
  const stateKey = [query ?? "", selectedCategory ?? "", selectedSet ?? "", selectedSort].join(":");

  return (
    <div className="page-grid">
      <section className="page-intro stack">
        <div className="stack">
          <h1>Pokemon Card Browser</h1>
          <p className="hero-copy">
            Search and explore English Pokemon cards with current pricing and portfolio tracking.
          </p>
        </div>
      </section>
      <CatalogFilters
        key={`filters:${stateKey}`}
        query={query}
        selectedSet={selectedSet}
        selectedSort={selectedSort}
        categories={categories}
        sets={sets}
        resetHref={resetHref}
      />
      {items.length ? (
        <InfiniteCardList
          key={`results:${stateKey}`}
          initialItems={items}
          query={query}
          selectedCategory={selectedCategory}
          selectedSet={selectedSet}
          selectedSort={selectedSort}
          pageSize={PAGE_SIZE}
        />
      ) : (
        <CardEmptyState
          title="No cards found"
          body="Try a different search term or adjust the category and set filters."
        />
      )}
    </div>
  );
}
