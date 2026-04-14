import { describe, expect, it } from "vitest";
import { getPortfolio } from "@/lib/portfolio/get-portfolio";
import { addHolding } from "@/lib/portfolio/add-holding";

describe("portfolio contract", () => {
  it("returns holdings and total value", async () => {
    const portfolio = await getPortfolio();

    expect(portfolio).toMatchObject({
      holdings: expect.any(Array),
      totalEstimatedValue: expect.any(Number)
    });
  });

  it("returns holding records with the fields required by the mobile portfolio list", async () => {
    await addHolding("sv1-charizard-ex-en-nm-holo", 1);
    const portfolio = await getPortfolio();

    expect(portfolio.holdings[0]).toMatchObject({
      id: expect.any(String),
      cardVariationId: expect.any(String),
      quantity: expect.any(Number),
      estimatedValue: expect.any(Number)
    });
  });
});
