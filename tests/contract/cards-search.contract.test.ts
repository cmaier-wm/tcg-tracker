import { describe, expect, it } from "vitest";
import { getCardCatalog } from "@/lib/tcgtracking/get-card-catalog";

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
});
