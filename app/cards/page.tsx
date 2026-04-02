import React from "react";
import { CardEmptyState } from "@/components/cards/card-empty-state";
import { CardList } from "@/components/cards/card-list";
import { getCardCatalog } from "@/lib/tcgtracking/get-card-catalog";

export default async function CardsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; category?: string; set?: string }>;
}) {
  const params = await searchParams;
  const items = await getCardCatalog(params);

  return (
    <div className="page-grid">
      <section className="panel">
        <p className="eyebrow">Browse catalog</p>
        <h1>Cards and variants</h1>
        <p className="muted">
          Explore supported cards, compare language and finish variants, and open the
          detail view for pricing.
        </p>
      </section>
      {items.length ? (
        <CardList items={items} />
      ) : (
        <CardEmptyState
          title="No cards found"
          body="Try a different search term or category filter."
        />
      )}
    </div>
  );
}
