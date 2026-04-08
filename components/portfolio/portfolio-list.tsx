import React from "react";
import Link from "next/link";
import { toCurrency } from "@/lib/api/serializers";
import { CardImage } from "@/components/cards/card-image";
import { HoldingForm } from "@/components/portfolio/holding-form";

type Holding = {
  id: string;
  cardVariationId: string;
  cardName: string;
  variationLabel: string;
  quantity: number;
  estimatedValue: number;
  cardId?: string | null;
  category?: string | null;
  imageUrl?: string | null;
};

export function PortfolioList({ holdings }: { holdings: Holding[] }) {
  return (
    <div className="portfolio-list">
      {holdings.map((holding) => (
        <article key={holding.id} className="portfolio-row">
          <div className="portfolio-media">
            {holding.cardId && holding.category ? (
              <Link href={`/cards/${holding.category}/${holding.cardId}`}>
                <CardImage name={holding.cardName} imageUrl={holding.imageUrl} />
              </Link>
            ) : (
              <CardImage name={holding.cardName} imageUrl={holding.imageUrl} />
            )}
          </div>
          <div className="portfolio-main">
            <div>
              {holding.cardId && holding.category ? (
                <Link href={`/cards/${holding.category}/${holding.cardId}`} className="inline-link">
                  <h3>{holding.cardName}</h3>
                </Link>
              ) : (
                <h3>{holding.cardName}</h3>
              )}
              <p className="muted">English</p>
            </div>
            <div className="badge-row">
              <span className="badge">Qty {holding.quantity}</span>
            </div>
            <HoldingForm
              key={`${holding.id}:${holding.quantity}`}
              holdingId={holding.id}
              quantity={holding.quantity}
              cardName={holding.cardName}
              variationLabel="English"
              compact
            />
          </div>
          <div className="portfolio-metric">
            <p className="eyebrow">Estimated value</p>
            <strong>{toCurrency(holding.estimatedValue)}</strong>
          </div>
        </article>
      ))}
    </div>
  );
}
