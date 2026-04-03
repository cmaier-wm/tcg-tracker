import { describe, expect, it } from "vitest";
import type { CardListItem } from "@/lib/tcgtracking/mappers";
import {
  getCatalogSortOptions,
  matchesSearchTokens,
  normalizeCatalogSort,
  sortCardListItems,
  tokenizeSearchQuery
} from "@/lib/tcgtracking/search-query";

const sampleItems: CardListItem[] = [
  {
    id: "card-1",
    category: "pokemon",
    categoryName: "Pokemon",
    setName: "Base Set",
    name: "Zapdos",
    collectorNumber: "16/102",
    rarity: "Rare",
    currentPrice: 20,
    variationCount: 1
  },
  {
    id: "card-2",
    category: "pokemon",
    categoryName: "Pokemon",
    setName: "Jungle",
    name: "Bulbasaur",
    collectorNumber: "2/64",
    rarity: "Common",
    currentPrice: 5,
    variationCount: 1
  },
  {
    id: "card-3",
    category: "pokemon",
    categoryName: "Pokemon",
    setName: "Team Rocket",
    name: "Alakazam",
    collectorNumber: "101/105",
    rarity: "Ultra Rare",
    variationCount: 1
  },
  {
    id: "card-4",
    category: "pokemon",
    categoryName: "Pokemon",
    setName: "Aquapolis",
    name: "Charmander",
    collectorNumber: "12/147",
    rarity: "Alternate Art",
    currentPrice: 20,
    variationCount: 1
  },
  {
    id: "card-5",
    category: "pokemon",
    categoryName: "Pokemon",
    setName: "Neo Genesis",
    name: "Eevee",
    rarity: "Mythic",
    currentPrice: 9,
    variationCount: 1
  }
];

describe("search query helpers", () => {
  it("tokenizes search text", () => {
    expect(tokenizeSearchQuery("lugia 186")).toEqual(["lugia", "186"]);
  });

  it("matches card name and collector number tokens together", () => {
    expect(
      matchesSearchTokens(
        ["Lugia V (Alternate Full Art)", "SWSH12: Silver Tempest", "186/195"],
        ["lugia", "186"]
      )
    ).toBe(true);
  });

  it("lists the supported sort options", () => {
    expect(getCatalogSortOptions().map((option) => option.value)).toEqual([
      "price-desc",
      "price-asc",
      "name-asc",
      "name-desc",
      "number-asc",
      "number-desc",
      "set-asc",
      "set-desc",
      "rarity-asc",
      "rarity-desc"
    ]);
  });

  it("normalizes unsupported sorts to the default option", () => {
    expect(normalizeCatalogSort(undefined)).toBe("price-desc");
    expect(normalizeCatalogSort("rarity-desc")).toBe("rarity-desc");
    expect(normalizeCatalogSort("unknown-sort")).toBe("price-desc");
  });

  it("sorts priced cards by price descending and keeps missing prices last", () => {
    expect(sortCardListItems(sampleItems, "price-desc").map((item) => item.id)).toEqual([
      "card-4",
      "card-1",
      "card-5",
      "card-2",
      "card-3"
    ]);
  });

  it("sorts priced cards by price ascending and keeps missing prices last", () => {
    expect(sortCardListItems(sampleItems, "price-asc").map((item) => item.id)).toEqual([
      "card-2",
      "card-5",
      "card-4",
      "card-1",
      "card-3"
    ]);
  });

  it("sorts collector numbers with numeric awareness in both directions", () => {
    expect(sortCardListItems(sampleItems, "number-asc").map((item) => item.id)).toEqual([
      "card-2",
      "card-4",
      "card-1",
      "card-3",
      "card-5"
    ]);
    expect(sortCardListItems(sampleItems, "number-desc").map((item) => item.id)).toEqual([
      "card-3",
      "card-1",
      "card-4",
      "card-2",
      "card-5"
    ]);
  });

  it("sorts by set and name in both directions", () => {
    expect(sortCardListItems(sampleItems, "set-asc").map((item) => item.id)).toEqual([
      "card-4",
      "card-1",
      "card-2",
      "card-5",
      "card-3"
    ]);
    expect(sortCardListItems(sampleItems, "name-desc").map((item) => item.id)).toEqual([
      "card-1",
      "card-5",
      "card-4",
      "card-2",
      "card-3"
    ]);
  });

  it("sorts rarity by normalized rank and keeps unknown rarities deterministic", () => {
    expect(sortCardListItems(sampleItems, "rarity-asc").map((item) => item.id)).toEqual([
      "card-2",
      "card-1",
      "card-3",
      "card-4",
      "card-5"
    ]);
    expect(sortCardListItems(sampleItems, "rarity-desc").map((item) => item.id)).toEqual([
      "card-4",
      "card-3",
      "card-1",
      "card-2",
      "card-5"
    ]);
  });
});
