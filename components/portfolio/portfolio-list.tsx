import React from "react";
import { toCurrency } from "@/lib/api/serializers";
import { CardImage } from "@/components/cards/card-image";

type Holding = {
  id: string;
  cardVariationId: string;
  cardName: string;
  variationLabel: string;
  quantity: number;
  estimatedValue: number;
  imageUrl?: string | null;
};

export function PortfolioList({ holdings }: { holdings: Holding[] }) {
  return (
    <div className="card-list">
      {holdings.map((holding) => (
        <article key={holding.id} className="card-row">
          <CardImage name={holding.cardName} imageUrl={holding.imageUrl} />
          <div>
            <h3>{holding.cardName}</h3>
            <p className="muted">{holding.variationLabel}</p>
            <div className="badge-row">
              <span className="badge">Qty {holding.quantity}</span>
            </div>
          </div>
          <div>
            <p className="eyebrow">Estimated value</p>
            <strong>{toCurrency(holding.estimatedValue)}</strong>
          </div>
        </article>
      ))}
    </div>
  );
}
