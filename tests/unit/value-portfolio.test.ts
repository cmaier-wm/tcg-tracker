import { describe, expect, it } from "vitest";
import { valuePortfolio } from "@/lib/portfolio/value-portfolio";

describe("valuePortfolio", () => {
  it("calculates total estimated value", () => {
    const result = valuePortfolio([
      { id: "sample", cardVariationId: "sv1-charizard-ex-en-nm-holo", quantity: 2 }
    ]);

    expect(result.totalEstimatedValue).toBeGreaterThan(0);
    expect(result.holdings[0].quantity).toBe(2);
  });
});

