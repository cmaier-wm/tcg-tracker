type CardVariationLike = {
  languageCode?: string | null;
  currentPrice?: number | null;
  conditionCode?: string | null;
  isDefault?: boolean | null;
};

function isEnglishVariation(variation: CardVariationLike) {
  return variation.languageCode?.toLowerCase() === "en";
}

function getLanguageRank(variation: CardVariationLike) {
  if (isEnglishVariation(variation)) {
    return 0;
  }

  if (variation.languageCode == null) {
    return 1;
  }

  return 2;
}

function getPriceRank(variation: CardVariationLike) {
  return variation.currentPrice != null ? 0 : 1;
}

function getConditionRank(variation: CardVariationLike) {
  switch (variation.conditionCode?.toUpperCase()) {
    case "NM":
      return 0;
    case "LP":
      return 1;
    case "MP":
      return 2;
    case "HP":
      return 3;
    case "DMG":
      return 4;
    case undefined:
    case null:
      return 5;
    default:
      return 6;
  }
}

export function selectPreferredVariation<T extends CardVariationLike>(variations: T[]) {
  return variations.reduce<T | undefined>((bestVariation, variation) => {
    if (!bestVariation) {
      return variation;
    }

    const candidateRank = [
      getPriceRank(variation),
      getLanguageRank(variation),
      getConditionRank(variation),
      variation.isDefault ? 0 : 1,
      -(variation.currentPrice ?? -1)
    ];
    const currentRank = [
      getPriceRank(bestVariation),
      getLanguageRank(bestVariation),
      getConditionRank(bestVariation),
      bestVariation.isDefault ? 0 : 1,
      -(bestVariation.currentPrice ?? -1)
    ];

    for (let index = 0; index < candidateRank.length; index += 1) {
      if (candidateRank[index] < currentRank[index]) {
        return variation;
      }

      if (candidateRank[index] > currentRank[index]) {
        return bestVariation;
      }
    }

    return bestVariation;
  }, undefined);
}
