type PortfolioSortField = "price" | "name" | "quantity";
type PortfolioSortDirection = "asc" | "desc";

export type PortfolioSortValue =
  | "price-desc"
  | "price-asc"
  | "name-asc"
  | "name-desc"
  | "quantity-desc"
  | "quantity-asc";

export type PortfolioSortOption = {
  value: PortfolioSortValue;
  label: string;
  field: PortfolioSortField;
  direction: PortfolioSortDirection;
};

type SortableHolding = {
  id: string;
  cardName: string;
  quantity: number;
  estimatedValue: number;
};

const portfolioSortOptions: PortfolioSortOption[] = [
  {
    value: "price-desc",
    label: "Highest value",
    field: "price",
    direction: "desc"
  },
  {
    value: "price-asc",
    label: "Lowest value",
    field: "price",
    direction: "asc"
  },
  {
    value: "name-asc",
    label: "Name (A-Z)",
    field: "name",
    direction: "asc"
  },
  {
    value: "name-desc",
    label: "Name (Z-A)",
    field: "name",
    direction: "desc"
  },
  {
    value: "quantity-desc",
    label: "Highest quantity",
    field: "quantity",
    direction: "desc"
  },
  {
    value: "quantity-asc",
    label: "Lowest quantity",
    field: "quantity",
    direction: "asc"
  }
];

const defaultPortfolioSort: PortfolioSortValue = "price-desc";
const portfolioSortValueSet = new Set(portfolioSortOptions.map((option) => option.value));
const collator = new Intl.Collator("en", {
  sensitivity: "base",
  numeric: true
});

function compareNumbers(left: number, right: number, direction: PortfolioSortDirection) {
  if (left === right) {
    return 0;
  }

  return direction === "asc" ? left - right : right - left;
}

function compareText(left: string, right: string, direction: PortfolioSortDirection) {
  const result = collator.compare(left, right);
  return direction === "asc" ? result : result * -1;
}

function compareHoldingNames(left: SortableHolding, right: SortableHolding) {
  const byName = collator.compare(left.cardName, right.cardName);

  if (byName !== 0) {
    return byName;
  }

  return collator.compare(left.id, right.id);
}

export function getPortfolioSortOptions() {
  return portfolioSortOptions;
}

export function normalizePortfolioSort(value?: string | null): PortfolioSortValue {
  if (value && portfolioSortValueSet.has(value as PortfolioSortValue)) {
    return value as PortfolioSortValue;
  }

  return defaultPortfolioSort;
}

export function sortPortfolioHoldings<T extends SortableHolding>(
  holdings: T[],
  sort: PortfolioSortValue
) {
  const selectedSort = portfolioSortOptions.find((option) => option.value === sort);

  if (!selectedSort) {
    return [...holdings];
  }

  return [...holdings].sort((left, right) => {
    let result = 0;

    switch (selectedSort.field) {
      case "price":
        result = compareNumbers(left.estimatedValue, right.estimatedValue, selectedSort.direction);
        break;
      case "name":
        result = compareText(left.cardName, right.cardName, selectedSort.direction);
        break;
      case "quantity":
        result = compareNumbers(left.quantity, right.quantity, selectedSort.direction);
        break;
    }

    if (result !== 0) {
      return result;
    }

    return compareHoldingNames(left, right);
  });
}
