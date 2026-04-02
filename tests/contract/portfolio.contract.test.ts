import { describe, expect, it } from "vitest";
import { getPortfolio } from "@/lib/portfolio/get-portfolio";

describe("portfolio contract", () => {
  it("returns holdings and total value", async () => {
    const portfolio = await getPortfolio();

    expect(portfolio).toMatchObject({
      holdings: expect.any(Array),
      totalEstimatedValue: expect.any(Number)
    });
  });
});

