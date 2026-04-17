import { describe, expect, it } from "vitest";
import { getCardCatalog } from "@/lib/tcgtracking/get-card-catalog";
import { getCatalogSortOptions } from "@/lib/tcgtracking/search-query";

describe("cards search contract", () => {
  it("returns list items with expected fields", async () => {
    const items = await getCardCatalog({ q: "charizard" });

    expect(items[0]).toMatchObject({
      id: expect.any(String),
      productType: expect.any(String),
      category: expect.any(String),
      setName: expect.any(String),
      name: expect.any(String)
    });
  });

  it("preserves mobile browse fields for imagery and pricing metadata", async () => {
    const items = await getCardCatalog({ q: "charizard" });

    expect(items[0]).toMatchObject({
      imageUrl: expect.any(String),
      currentPrice: expect.any(Number),
      variationCount: expect.any(Number)
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

  it("defaults missing or invalid product types to card filtering", async () => {
    const [withoutType, invalidType, explicitDefault] = await Promise.all([
      getCardCatalog(),
      getCardCatalog({ productType: "cards" }),
      getCardCatalog({ productType: "card" })
    ]);

    expect(withoutType.map((item) => item.id)).toEqual(explicitDefault.map((item) => item.id));
    expect(invalidType.map((item) => item.id)).toEqual(explicitDefault.map((item) => item.id));
    expect(explicitDefault.every((item) => item.productType === "card")).toBe(true);
  });

  it("filters to sealed products when requested", async () => {
    const items = await getCardCatalog({ productType: "sealed-product" });

    expect(items.length).toBeGreaterThan(0);
    expect(items.every((item) => item.productType === "sealed-product")).toBe(true);
  });

  it("preserves combined query, sort, and productType requests", async () => {
    const items = await getCardCatalog({
      q: "booster",
      sort: "price-desc",
      productType: "sealed-product"
    });

    expect(items.map((item) => item.name)).toContain("Scarlet & Violet Booster Box");
    expect(items.every((item) => item.productType === "sealed-product")).toBe(true);
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

  it("applies limit and offset after sorting", async () => {
    const items = await getCardCatalog({
      sort: "price-desc",
      limit: 1,
      offset: 1
    });

    expect(items).toHaveLength(1);
    expect(items[0]?.name).toBe("Charizard ex");
  });
});
