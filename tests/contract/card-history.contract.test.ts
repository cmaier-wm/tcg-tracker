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

  it("returns an array shape for mobile chart rendering", async () => {
    const history = await getPriceHistory("sv1-charizard-ex-en-nm-holo");

    expect(Array.isArray(history.points)).toBe(true);
  });
});
