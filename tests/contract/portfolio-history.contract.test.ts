import { describe, expect, it } from "vitest";
import { getPortfolioHistory } from "@/lib/portfolio/get-portfolio-history";

describe("portfolio history contract", () => {
  it("returns valuation points", async () => {
    const history = await getPortfolioHistory();

    expect(history.points[0]).toMatchObject({
      capturedAt: expect.any(String),
      totalValue: expect.any(Number)
    });
  });

  it("keeps the history response array-shaped for mobile chart rendering", async () => {
    const history = await getPortfolioHistory();

    expect(Array.isArray(history.points)).toBe(true);
  });
});
