import React from "react";
import { CardImage } from "@/components/cards/card-image";

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
      isDefault?: boolean | null;
      currentPrice?: number | null;
    }>;
  };
  selectedVariationId?: string;
  sideContent?: React.ReactNode;
};

export function CardDetail({ card, selectedVariationId, sideContent }: CardDetailProps) {
  const selectedVariation = card.variations.find(
    (variation) => variation.id === selectedVariationId
  );
  const variationBadges = [
    toLanguageLabel(selectedVariation?.languageCode),
    selectedVariation?.finish ?? null,
    selectedVariation?.conditionCode ?? null
  ].filter((value): value is string => Boolean(value));

  return (
    <div className="detail-grid">
      <div className="surface-card detail-image-card">
        <CardImage name={card.name} imageUrl={card.imageUrl} />
      </div>
      <div className="detail-side-column">
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
            {variationBadges.map((badge) => (
              <span key={badge} className="badge">
                {badge}
              </span>
            ))}
          </div>
        </div>
        {sideContent}
      </div>
    </div>
  );
}

function toLanguageLabel(languageCode?: string | null) {
  switch (languageCode?.toLowerCase()) {
    case "en":
      return "English";
    case "jp":
      return "Japanese";
    default:
      return languageCode ?? null;
  }
}
