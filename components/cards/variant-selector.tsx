import React from "react";
import Link from "next/link";

type Variation = {
  id: string;
  label: string;
  languageCode?: string | null;
  finish?: string | null;
  conditionCode?: string | null;
  currentPrice?: number | null;
};

type VariantSelectorProps = {
  variations: Variation[];
  selectedVariationId?: string;
  hrefBase: string;
};

export function VariantSelector({
  variations,
  selectedVariationId,
  hrefBase
}: VariantSelectorProps) {
  return (
    <div className="stack">
      <h3>Language Variations</h3>
      <div className="variant-list">
        {variations.map((variation) => (
          <Link
            key={variation.id}
            className={variation.id === selectedVariationId ? "variant-link active" : "variant-link"}
            href={`${hrefBase}?variationId=${variation.id}`}
          >
            <span>{variation.label}</span>
            {variation.currentPrice != null ? (
              <strong>${variation.currentPrice.toFixed(2)}</strong>
            ) : (
              <span className="muted">No price</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
