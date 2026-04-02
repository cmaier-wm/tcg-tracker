import React from "react";

type Variation = {
  id: string;
  label: string;
  languageCode?: string | null;
  finish?: string | null;
  conditionCode?: string | null;
};

type VariantSelectorProps = {
  variations: Variation[];
  selectedVariationId?: string;
};

export function VariantSelector({
  variations,
  selectedVariationId
}: VariantSelectorProps) {
  return (
    <div className="stack">
      <h3>Available variants</h3>
      <div className="badge-row">
        {variations.map((variation) => (
          <span
            key={variation.id}
            className="badge"
            style={
              variation.id === selectedVariationId
                ? { border: "1px solid var(--accent)", background: "white" }
                : undefined
            }
          >
            {variation.label}
          </span>
        ))}
      </div>
    </div>
  );
}
