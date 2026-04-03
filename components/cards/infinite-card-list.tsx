"use client";

import React, { useEffect, useRef, useState } from "react";
import { CardList } from "@/components/cards/card-list";
import type { CardListItem } from "@/lib/tcgtracking/mappers";

type InfiniteCardListProps = {
  initialItems: CardListItem[];
  query?: string;
  selectedCategory?: string;
  selectedSet?: string;
  pageSize: number;
};

export function InfiniteCardList({
  initialItems,
  query,
  selectedCategory,
  selectedSet,
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
  }, [initialItems, pageSize, query, selectedCategory, selectedSet]);

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
          limit: String(pageSize)
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
  }, [hasMore, items.length, pageSize, query, selectedCategory, selectedSet]);

  return (
    <>
      <CardList items={items} />
      <div className="catalog-load-state" aria-live="polite">
        {isLoading ? <p>Loading more cards...</p> : null}
        {!hasMore ? <p>All matching cards loaded.</p> : null}
      </div>
      {hasMore ? (
        <div ref={loaderRef} className="catalog-scroll-sentinel" aria-hidden="true" />
      ) : null}
    </>
  );
}
