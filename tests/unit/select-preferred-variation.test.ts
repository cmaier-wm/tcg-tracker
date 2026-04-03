import { describe, expect, it } from "vitest";
import { selectPreferredVariation } from "@/lib/tcgtracking/select-preferred-variation";

describe("selectPreferredVariation", () => {
  it("prefers an english variation with a price", () => {
    const variation = selectPreferredVariation([
      {
        languageCode: "jp",
        currentPrice: 20
      },
      {
        languageCode: "en",
        currentPrice: 30
      }
    ]);

    expect(variation).toMatchObject({
      languageCode: "en",
      currentPrice: 30
    });
  });

  it("falls back to an english variation without a price before a non-english priced one", () => {
    const variation = selectPreferredVariation([
      {
        languageCode: "jp",
        currentPrice: 20
      },
      {
        languageCode: "en",
        currentPrice: null
      }
    ]);

    expect(variation).toMatchObject({
      languageCode: "en",
      currentPrice: null
    });
  });
});
