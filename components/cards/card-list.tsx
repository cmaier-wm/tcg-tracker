import React from "react";
import Link from "next/link";
import type { CardListItem } from "@/lib/tcgtracking/mappers";
import { CardImage } from "@/components/cards/card-image";

export function CardList({ items }: { items: CardListItem[] }) {
  return (
    <div className="card-grid">
      {items.map((card) => (
        <Link
          key={card.id}
          href={`/cards/${card.category}/${card.id}`}
          className="catalog-card"
        >
          <div className="catalog-card-media">
            <CardImage name={card.name} imageUrl={card.imageUrl} />
          </div>
          <div className="catalog-card-body">
            <h3>{card.name}</h3>
            <p className="muted">
              {card.setName}
              {card.collectorNumber ? ` · ${card.collectorNumber}` : ""}
            </p>
            {card.rarity ? (
              <div className="badge-row">
                <span className="badge">{card.rarity}</span>
              </div>
            ) : null}
          </div>
          <div className="catalog-card-footer">
            <strong>
              {card.currentPrice != null ? `$${card.currentPrice.toFixed(2)}` : "No price"}
            </strong>
            <span className="muted">English</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
