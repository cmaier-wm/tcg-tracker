import { beforeEach, describe, expect, it } from "vitest";
import { resetDemoStore } from "@/lib/db/demo-store";
import { addHolding } from "@/lib/portfolio/add-holding";
import { getPortfolio } from "@/lib/portfolio/get-portfolio";

describe("portfolio service", () => {
  beforeEach(() => {
    resetDemoStore();
  });

  it("adds a holding and reflects it in the portfolio", async () => {
    await addHolding("onepiece-luffy-en-foil", 1);
    const portfolio = await getPortfolio();

    expect(
      portfolio.holdings.some((holding) => holding.cardVariationId === "onepiece-luffy-en-foil")
    ).toBe(true);
  });
});
