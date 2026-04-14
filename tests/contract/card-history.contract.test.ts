import { describe, expect, it } from "vitest";
import { getPriceHistory } from "@/lib/pricing/get-price-history";

describe("card history contract", () => {
  it("returns time-series points for a variation", async () => {
    const history = await getPriceHistory("sv1-charizard-ex-en-nm-holo");

    expect(history.points[0]).toMatchObject({
      capturedAt: expect.any(String),
      marketPrice: expect.any(Number)
    });
  });
});

