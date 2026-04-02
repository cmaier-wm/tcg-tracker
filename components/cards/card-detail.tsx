import React from "react";
import { CardImage } from "@/components/cards/card-image";
import { VariantSelector } from "@/components/cards/variant-selector";

type CardDetailProps = {
  card: {
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
    }>;
  };
  selectedVariationId?: string;
};

export function CardDetail({ card, selectedVariationId }: CardDetailProps) {
  return (
    <div className="grid-two">
      <div className="panel">
        <CardImage name={card.name} imageUrl={card.imageUrl} />
      </div>
      <div className="panel stack">
        <div>
          <h1>{card.name}</h1>
          <p className="muted">
            {card.setName}
            {card.collectorNumber ? ` · #${card.collectorNumber}` : ""}
            {card.rarity ? ` · ${card.rarity}` : ""}
          </p>
        </div>
        <VariantSelector
          variations={card.variations}
          selectedVariationId={selectedVariationId}
        />
      </div>
    </div>
  );
}
