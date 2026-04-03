type CardVariationLike = {
  languageCode?: string | null;
  currentPrice?: number | null;
};

function isEnglishVariation(variation: CardVariationLike) {
  return variation.languageCode?.toLowerCase() === "en";
}

export function selectPreferredVariation<T extends CardVariationLike>(variations: T[]) {
  return (
    variations.find((variation) => isEnglishVariation(variation) && variation.currentPrice != null) ??
    variations.find((variation) => isEnglishVariation(variation)) ??
    variations.find((variation) => variation.currentPrice != null) ??
    variations[0]
  );
}
