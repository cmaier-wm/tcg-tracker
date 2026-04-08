import { describe, expect, it } from "vitest";
import {
  getPortfolioSortOptions,
  normalizePortfolioSort,
  sortPortfolioHoldings
} from "@/lib/portfolio/portfolio-sort";

const sampleHoldings = [
  { id: "holding-2", cardName: "Bulbasaur", quantity: 2, estimatedValue: 12 },
  { id: "holding-1", cardName: "Charizard", quantity: 1, estimatedValue: 50 },
  { id: "holding-3", cardName: "Abra", quantity: 5, estimatedValue: 12 }
];

describe("portfolio sort helpers", () => {
  it("lists the supported sort options", () => {
    expect(getPortfolioSortOptions().map((option) => option.value)).toEqual([
      "price-desc",
      "price-asc",
      "name-asc",
      "name-desc",
      "quantity-desc",
      "quantity-asc"
    ]);
  });

  it("defaults missing and invalid values to highest value first", () => {
    expect(normalizePortfolioSort(undefined)).toBe("price-desc");
    expect(normalizePortfolioSort("unknown-sort")).toBe("price-desc");
  });

  it("sorts holdings by estimated value descending by default", () => {
    expect(sortPortfolioHoldings(sampleHoldings, "price-desc").map((holding) => holding.id)).toEqual([
      "holding-1",
      "holding-3",
      "holding-2"
    ]);
  });

  it("sorts holdings by name and quantity deterministically", () => {
    expect(sortPortfolioHoldings(sampleHoldings, "name-asc").map((holding) => holding.id)).toEqual([
      "holding-3",
      "holding-2",
      "holding-1"
    ]);

    expect(
      sortPortfolioHoldings(sampleHoldings, "quantity-desc").map((holding) => holding.id)
    ).toEqual(["holding-3", "holding-2", "holding-1"]);
  });
});
