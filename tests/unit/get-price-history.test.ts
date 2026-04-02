import { describe, expect, it } from "vitest";
import { getPriceHistory } from "@/lib/pricing/get-price-history";

describe("getPriceHistory", () => {
  it("returns multiple points for tracked demo variations", async () => {
    const history = await getPriceHistory("sv1-charizard-ex-en-nm-holo");

    expect(history.points.length).toBeGreaterThan(1);
  });
});

