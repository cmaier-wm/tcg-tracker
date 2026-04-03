import React from "react";
import Link from "next/link";
import type { CatalogCategory } from "@/lib/tcgtracking/get-categories";
import type { CatalogSet } from "@/lib/tcgtracking/get-sets";

type CatalogFiltersProps = {
  query?: string;
  selectedSet?: string;
  categories: CatalogCategory[];
  sets: CatalogSet[];
  resetHref: string;
};

export function CatalogFilters({
  query,
  selectedSet,
  categories: _categories,
  sets,
  resetHref
}: CatalogFiltersProps) {
  return (
    <form className="surface-card filter-grid" method="GET">
      <div className="field">
        <label htmlFor="card-search">Search cards</label>
        <input
          id="card-search"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Charizard, Pikachu, Gengar..."
        />
      </div>
      <div className="field">
        <label htmlFor="set-filter">Set</label>
        <select id="set-filter" name="set" defaultValue={selectedSet ?? ""}>
          <option value="">All sets</option>
          {sets.map((set) => (
            <option key={`${set.categorySlug}:${set.slug}`} value={set.slug}>
              {set.name}
            </option>
          ))}
        </select>
      </div>
      <div className="button-row">
        <button className="button" type="submit">
          Search
        </button>
        <Link className="button secondary" href={resetHref}>
          Reset
        </Link>
      </div>
    </form>
  );
}
