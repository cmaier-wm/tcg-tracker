import React from "react";
import Link from "next/link";
import type { CardListItem } from "@/lib/tcgtracking/mappers";
import { CardImage } from "@/components/cards/card-image";

export function CardList({ items }: { items: CardListItem[] }) {
  return (
    <div className="card-list">
      {items.map((card) => (
        <Link
          key={card.id}
          href={`/cards/${card.category}/${card.id}`}
          className="card-row"
        >
          <CardImage name={card.name} imageUrl={card.imageUrl} />
          <div>
            <h3>{card.name}</h3>
            <p className="muted">
              {card.categoryName} · {card.setName}
            </p>
            <div className="badge-row">
              {card.collectorNumber ? <span className="badge">#{card.collectorNumber}</span> : null}
              {card.rarity ? <span className="badge">{card.rarity}</span> : null}
            </div>
          </div>
          <div className="muted">View card</div>
        </Link>
      ))}
    </div>
  );
}
