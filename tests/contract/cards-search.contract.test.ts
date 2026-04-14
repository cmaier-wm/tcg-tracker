import { describe, expect, it } from "vitest";
import { getCardCatalog } from "@/lib/tcgtracking/get-card-catalog";
import { getCatalogSortOptions } from "@/lib/tcgtracking/search-query";

describe("cards search contract", () => {
  it("returns list items with expected fields", async () => {
    const items = await getCardCatalog({ q: "charizard" });

    expect(items[0]).toMatchObject({
      id: expect.any(String),
      category: expect.any(String),
      setName: expect.any(String),
      name: expect.any(String)
    });
  });

  it("matches card names and collector numbers together", async () => {
    const items = await getCardCatalog({ q: "charizard 125" });

    expect(
      items.some(
        (item) =>
          item.name.toLowerCase().includes("charizard") &&
          item.collectorNumber?.includes("125")
      )
    ).toBe(true);
  });

  it("supports the documented sort values", async () => {
    const results = await Promise.all(
      getCatalogSortOptions().map((option) => getCardCatalog({ sort: option.value }))
    );

    expect(results.every((items) => items.length > 0)).toBe(true);
  });

  it("defaults missing or invalid sort values to price-desc ordering", async () => {
    const [withoutSort, invalidSort, explicitDefault] = await Promise.all([
      getCardCatalog(),
      getCardCatalog({ sort: "not-a-sort" }),
      getCardCatalog({ sort: "price-desc" })
    ]);

    expect(withoutSort.map((item) => item.id)).toEqual(explicitDefault.map((item) => item.id));
    expect(invalidSort.map((item) => item.id)).toEqual(explicitDefault.map((item) => item.id));
  });

  it("orders cards by the requested field and direction", async () => {
    const [priceDescending, numberAscending, setDescending, rarityDescending] =
      await Promise.all([
        getCardCatalog({ sort: "price-desc" }),
        getCardCatalog({ sort: "number-asc" }),
        getCardCatalog({ sort: "set-desc" }),
        getCardCatalog({ sort: "rarity-desc" })
      ]);

    expect(priceDescending.map((item) => item.name)).toEqual([
      "Monkey.D.Luffy",
      "Charizard ex",
      "Belle - Strange but Special"
    ]);
    expect(numberAscending.map((item) => item.name)).toEqual([
      "Charizard ex",
      "Belle - Strange but Special",
      "Monkey.D.Luffy"
    ]);
    expect(setDescending.map((item) => item.setName)).toEqual([
      "Scarlet & Violet",
      "Romance Dawn",
      "Rise of the Floodborn"
    ]);
    expect(rarityDescending.map((item) => item.name)).toEqual([
      "Monkey.D.Luffy",
      "Charizard ex",
      "Belle - Strange but Special"
    ]);
  });
});
