"use client";

import React, { useRef, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { CatalogCategory } from "@/lib/tcgtracking/get-categories";
import type { CatalogSet } from "@/lib/tcgtracking/get-sets";
import { getCatalogSortOptions, type CatalogSortValue } from "@/lib/tcgtracking/search-query";

type CatalogFiltersProps = {
  query?: string;
  selectedSet?: string;
  selectedSort: CatalogSortValue;
  categories: CatalogCategory[];
  sets: CatalogSet[];
  resetHref: string;
};

const defaultCatalogSortValue: CatalogSortValue = "price-desc";

export function CatalogFilters({
  query,
  selectedSet,
  selectedSort,
  categories: _categories,
  sets,
  resetHref
}: CatalogFiltersProps) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, startNavigation] = useTransition();

  function navigateWithForm() {
    const form = formRef.current;

    if (!form) {
      return;
    }

    const formData = new FormData(form);
    const params = new URLSearchParams();

    const nextQuery = formData.get("q")?.toString().trim();
    const nextSet = formData.get("set")?.toString().trim();
    const nextSort = formData.get("sort")?.toString().trim();

    if (nextQuery) {
      params.set("q", nextQuery);
    }

    if (nextSet) {
      params.set("set", nextSet);
    }

    if (nextSort) {
      params.set("sort", nextSort);
    }

    const nextUrl = params.size ? `${pathname}?${params.toString()}` : pathname;
    const currentUrl = searchParams.size ? `${pathname}?${searchParams.toString()}` : pathname;

    if (nextUrl === currentUrl) {
      return;
    }

    startNavigation(() => {
      router.replace(nextUrl);
    });
  }

  function submitFilters() {
    navigateWithForm();
  }

  function resetFilters() {
    const form = formRef.current;

    if (form) {
      const queryInput = form.elements.namedItem("q");
      const setSelect = form.elements.namedItem("set");
      const sortSelect = form.elements.namedItem("sort");

      if (queryInput instanceof HTMLInputElement) {
        queryInput.value = "";
      }

      if (setSelect instanceof HTMLSelectElement) {
        setSelect.value = "";
      }

      if (sortSelect instanceof HTMLSelectElement) {
        sortSelect.value = defaultCatalogSortValue;
      }
    }

    const currentUrl = searchParams.size ? `${pathname}?${searchParams.toString()}` : pathname;

    if (resetHref === currentUrl) {
      return;
    }

    startNavigation(() => {
      router.replace(resetHref);
    });
  }

  return (
    <form
      ref={formRef}
      className="surface-card filter-grid"
      method="GET"
      onSubmit={(event) => {
        event.preventDefault();
        navigateWithForm();
      }}
    >
      <div className="field search-field">
        <label htmlFor="card-search">Search cards</label>
        <div className="search-input-row">
          <input
            id="card-search"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Search by card name, set, or collector number"
          />
          <button className="button" type="submit" disabled={isNavigating}>
            Search
          </button>
        </div>
      </div>
      <div className="field">
        <label htmlFor="set-filter">Set</label>
        <select
          id="set-filter"
          name="set"
          defaultValue={selectedSet ?? ""}
          onChange={submitFilters}
        >
          <option value="">All sets</option>
          {sets.map((set) => (
            <option key={`${set.categorySlug}:${set.slug}`} value={set.slug}>
              {set.name}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="sort-filter">Sort</label>
        <select
          id="sort-filter"
          name="sort"
          defaultValue={selectedSort}
          onChange={submitFilters}
        >
          {getCatalogSortOptions().map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="button-row filter-actions">
        <button
          className="button secondary"
          type="button"
          onClick={resetFilters}
          disabled={isNavigating}
        >
          Reset
        </button>
        {isNavigating ? (
          <div className="catalog-filter-loading" role="status" aria-label="Applying filters">
            <div className="catalog-spinner pokeball-spinner" aria-hidden="true">
              <span className="pokeball-spinner-button" />
            </div>
          </div>
        ) : null}
      </div>
    </form>
  );
}
