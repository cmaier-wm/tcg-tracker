import { describe, expect, it } from "vitest";
import { selectPreferredVariation } from "@/lib/tcgtracking/select-preferred-variation";

describe("selectPreferredVariation", () => {
  it("prefers the best priced English condition instead of the first priced English variation", () => {
    const variation = selectPreferredVariation([
      {
        id: "en-dmg",
        languageCode: "en",
        conditionCode: "DMG",
        currentPrice: 104.98
      },
      {
        id: "en-nm",
        languageCode: "en",
        conditionCode: "NM",
        currentPrice: 473.24
      },
      {
        id: "generic-holofoil",
        languageCode: null,
        conditionCode: null,
        currentPrice: 473.08
      }
    ]);

    expect(variation).toMatchObject({
      id: "en-nm",
      currentPrice: 473.24
    });
  });

  it("falls back to a priced generic variation before an unpriced English default", () => {
    const variation = selectPreferredVariation([
      {
        id: "en-default",
        languageCode: "en",
        isDefault: true,
        currentPrice: null
      },
      {
        id: "generic-priced",
        languageCode: null,
        currentPrice: 22.5
      }
    ]);

    expect(variation).toMatchObject({
      id: "generic-priced",
      currentPrice: 22.5
    });
  });
});
