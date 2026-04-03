"use client";

import React, { useEffect, useRef, useState } from "react";
import { CardList } from "@/components/cards/card-list";
import type { CardListItem } from "@/lib/tcgtracking/mappers";
import type { CatalogSortValue } from "@/lib/tcgtracking/search-query";

type InfiniteCardListProps = {
  initialItems: CardListItem[];
  query?: string;
  selectedCategory?: string;
  selectedSet?: string;
  selectedSort: CatalogSortValue;
  pageSize: number;
};

export function InfiniteCardList({
  initialItems,
  query,
  selectedCategory,
  selectedSet,
  selectedSort,
  pageSize
}: InfiniteCardListProps) {
  const [items, setItems] = useState(initialItems);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialItems.length === pageSize);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const requestInFlightRef = useRef(false);

  useEffect(() => {
    setItems(initialItems);
    setIsLoading(false);
    setHasMore(initialItems.length === pageSize);
    requestInFlightRef.current = false;
  }, [initialItems, pageSize, query, selectedCategory, selectedSet, selectedSort]);

  useEffect(() => {
    const node = loaderRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (!entry?.isIntersecting || requestInFlightRef.current || !hasMore) {
          return;
        }

        requestInFlightRef.current = true;
        setIsLoading(true);

        const params = new URLSearchParams({
          offset: String(items.length),
          limit: String(pageSize),
          sort: selectedSort
        });

        if (query) {
          params.set("q", query);
        }

        if (selectedCategory) {
          params.set("category", selectedCategory);
        }

        if (selectedSet) {
          params.set("set", selectedSet);
        }

        fetch(`/api/cards?${params.toString()}`)
          .then(async (response) => {
            if (!response.ok) {
              throw new Error("Failed to load more cards.");
            }

            return response.json() as Promise<{ items: CardListItem[] }>;
          })
          .then((payload) => {
            setItems((currentItems) => [...currentItems, ...payload.items]);
            setHasMore(payload.items.length === pageSize);
          })
          .catch(() => {
            setHasMore(false);
          })
          .finally(() => {
            requestInFlightRef.current = false;
            setIsLoading(false);
          });
      },
      {
        rootMargin: "320px 0px"
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, items.length, pageSize, query, selectedCategory, selectedSet, selectedSort]);

  return (
    <>
      <CardList items={items} />
      <div className="catalog-load-state" aria-live="polite">
        {isLoading ? (
          <div className="catalog-spinner pokeball-spinner" role="status" aria-label="Loading more cards">
            <span className="pokeball-spinner-button" aria-hidden="true" />
          </div>
        ) : null}
        {!hasMore ? <p>All matching cards loaded.</p> : null}
      </div>
      {hasMore ? (
        <div ref={loaderRef} className="catalog-scroll-sentinel" aria-hidden="true" />
      ) : null}
    </>
  );
}
