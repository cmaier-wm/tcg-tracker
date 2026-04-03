import React from "react";
import { CardImage } from "@/components/cards/card-image";
import { VariantSelector } from "@/components/cards/variant-selector";

type CardDetailProps = {
  card: {
    id: string;
    category: string;
    name: string;
    setName: string;
    collectorNumber?: string | null;
    rarity?: string | null;
    imageUrl?: string | null;
    variations: Array<{
      id: string;
      label: string;
      languageCode?: string | null;
      finish?: string | null;
      conditionCode?: string | null;
      currentPrice?: number | null;
    }>;
  };
  selectedVariationId?: string;
};

export function CardDetail({ card, selectedVariationId }: CardDetailProps) {
  const selectedVariation =
    card.variations.find((variation) => variation.id === selectedVariationId) ?? card.variations[0];

  return (
    <div className="detail-grid">
      <div className="surface-card detail-image-card">
        <CardImage name={card.name} imageUrl={card.imageUrl} />
      </div>
      <div className="surface-card stack detail-content-card">
        <div>
          <h1>{card.name}</h1>
          <p className="muted">
            {card.setName}
            {card.collectorNumber ? ` · #${card.collectorNumber}` : ""}
          </p>
        </div>
        <div className="badge-row">
          {card.rarity ? <span className="badge">{card.rarity}</span> : null}
          {selectedVariation?.languageCode ? (
            <span className="badge subtle">{selectedVariation.languageCode.toUpperCase()}</span>
          ) : null}
        </div>
        <VariantSelector
          variations={card.variations}
          selectedVariationId={selectedVariationId}
          hrefBase={`/cards/${card.category}/${card.id}`}
        />
      </div>
    </div>
  );
}
