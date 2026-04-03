import type { CardListItem } from "@/lib/tcgtracking/mappers";

type CatalogSortField = "price" | "name" | "number" | "set" | "rarity";
type CatalogSortDirection = "asc" | "desc";

export type CatalogSortValue =
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc"
  | "number-asc"
  | "number-desc"
  | "set-asc"
  | "set-desc"
  | "rarity-asc"
  | "rarity-desc";

export type CatalogSortOption = {
  value: CatalogSortValue;
  label: string;
  field: CatalogSortField;
  direction: CatalogSortDirection;
  defaultOnHome: boolean;
};

const catalogSortOptions: CatalogSortOption[] = [
  {
    value: "price-desc",
    label: "Price: High to low",
    field: "price",
    direction: "desc",
    defaultOnHome: true
  },
  {
    value: "price-asc",
    label: "Price: Low to high",
    field: "price",
    direction: "asc",
    defaultOnHome: false
  },
  {
    value: "name-asc",
    label: "Name: A to Z",
    field: "name",
    direction: "asc",
    defaultOnHome: false
  },
  {
    value: "name-desc",
    label: "Name: Z to A",
    field: "name",
    direction: "desc",
    defaultOnHome: false
  },
  {
    value: "number-asc",
    label: "Number: Low to high",
    field: "number",
    direction: "asc",
    defaultOnHome: false
  },
  {
    value: "number-desc",
    label: "Number: High to low",
    field: "number",
    direction: "desc",
    defaultOnHome: false
  },
  {
    value: "set-asc",
    label: "Set: A to Z",
    field: "set",
    direction: "asc",
    defaultOnHome: false
  },
  {
    value: "set-desc",
    label: "Set: Z to A",
    field: "set",
    direction: "desc",
    defaultOnHome: false
  },
  {
    value: "rarity-asc",
    label: "Rarity: Low to high",
    field: "rarity",
    direction: "asc",
    defaultOnHome: false
  },
  {
    value: "rarity-desc",
    label: "Rarity: High to low",
    field: "rarity",
    direction: "desc",
    defaultOnHome: false
  }
];

const defaultCatalogSort: CatalogSortValue = "price-desc";
const catalogSortValueSet = new Set(catalogSortOptions.map((option) => option.value));
const naturalTextCollator = new Intl.Collator("en", {
  numeric: true,
  sensitivity: "base"
});
const rarityRankMatchers: Array<[pattern: string, rank: number]> = [
  ["common", 0],
  ["uncommon", 1],
  ["rare holo", 2],
  ["holo rare", 2],
  ["rare", 2],
  ["legendary", 3],
  ["double rare", 4],
  ["ultra rare", 5],
  ["special illustration rare", 7],
  ["illustration rare", 6],
  ["secret rare", 8],
  ["hyper rare", 9],
  ["alternate art", 10]
];

export function tokenizeSearchQuery(query?: string | null) {
  return (
    query
      ?.trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean) ?? []
  );
}

export function matchesSearchTokens(
  values: Array<string | null | undefined>,
  tokens: string[]
) {
  return tokens.every((token) =>
    values.some((value) => value?.toLowerCase().includes(token))
  );
}

export function getCatalogSortOptions() {
  return catalogSortOptions;
}

export function normalizeCatalogSort(value?: string | null): CatalogSortValue {
  if (value && catalogSortValueSet.has(value as CatalogSortValue)) {
    return value as CatalogSortValue;
  }

  return defaultCatalogSort;
}

function compareOptionalText(
  left: string | undefined,
  right: string | undefined,
  direction: CatalogSortDirection
) {
  const leftValue = left?.trim();
  const rightValue = right?.trim();

  if (!leftValue && !rightValue) {
    return 0;
  }

  if (!leftValue) {
    return 1;
  }

  if (!rightValue) {
    return -1;
  }

  const comparison = naturalTextCollator.compare(leftValue, rightValue);
  return direction === "asc" ? comparison : comparison * -1;
}

function compareOptionalNumber(
  left: number | undefined,
  right: number | undefined,
  direction: CatalogSortDirection
) {
  if (left == null && right == null) {
    return 0;
  }

  if (left == null) {
    return 1;
  }

  if (right == null) {
    return -1;
  }

  const comparison = left - right;
  return direction === "asc" ? comparison : comparison * -1;
}

function getRarityRank(value?: string) {
  const normalized = value?.trim().toLowerCase();

  if (!normalized) {
    return undefined;
  }

  const exactMatch = rarityRankMatchers.find(([pattern]) => normalized === pattern);

  if (exactMatch) {
    return exactMatch[1];
  }

  const partialMatch = rarityRankMatchers.find(([pattern]) => normalized.includes(pattern));
  return partialMatch?.[1];
}

function compareRarity(
  left: string | undefined,
  right: string | undefined,
  direction: CatalogSortDirection
) {
  const leftValue = left?.trim();
  const rightValue = right?.trim();

  if (!leftValue && !rightValue) {
    return 0;
  }

  if (!leftValue) {
    return 1;
  }

  if (!rightValue) {
    return -1;
  }

  const leftRank = getRarityRank(leftValue);
  const rightRank = getRarityRank(rightValue);

  if (leftRank != null && rightRank != null && leftRank !== rightRank) {
    return direction === "asc" ? leftRank - rightRank : rightRank - leftRank;
  }

  if (leftRank != null && rightRank == null) {
    return -1;
  }

  if (leftRank == null && rightRank != null) {
    return 1;
  }

  return compareOptionalText(leftValue, rightValue, direction);
}

function compareDeterministicTieBreakers(left: CardListItem, right: CardListItem) {
  return (
    compareOptionalText(left.name, right.name, "asc") ||
    compareOptionalText(left.setName, right.setName, "asc") ||
    compareOptionalText(left.collectorNumber, right.collectorNumber, "asc") ||
    compareRarity(left.rarity, right.rarity, "asc") ||
    compareOptionalNumber(left.currentPrice, right.currentPrice, "desc") ||
    naturalTextCollator.compare(left.id, right.id)
  );
}

export function sortCardListItems(items: CardListItem[], sort: CatalogSortValue) {
  const [field, direction] = sort.split("-") as [CatalogSortField, CatalogSortDirection];

  return items
    .map((item, index) => ({ item, index }))
    .sort((left, right) => {
      const leftItem = left.item;
      const rightItem = right.item;

      const primaryComparison =
        field === "price"
          ? compareOptionalNumber(leftItem.currentPrice, rightItem.currentPrice, direction)
          : field === "name"
            ? compareOptionalText(leftItem.name, rightItem.name, direction)
            : field === "number"
              ? compareOptionalText(
                  leftItem.collectorNumber,
                  rightItem.collectorNumber,
                  direction
                )
              : field === "set"
                ? compareOptionalText(leftItem.setName, rightItem.setName, direction)
                : compareRarity(leftItem.rarity, rightItem.rarity, direction);

      return primaryComparison || compareDeterministicTieBreakers(leftItem, rightItem) || left.index - right.index;
    })
    .map(({ item }) => item);
}
