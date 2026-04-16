import { describe, expect, it } from "vitest";
import { getCardDetail } from "@/lib/tcgtracking/get-card-detail";

describe("card detail contract", () => {
  it("returns variations for a matching card", async () => {
    const detail = await getCardDetail("pokemon", "sv1-charizard-ex");

    expect(detail).toMatchObject({
      id: "sv1-charizard-ex",
      name: "Charizard ex"
    });
    expect(detail.variations.length).toBeGreaterThan(0);
  });

  it("includes the fields required by the mobile detail layout", async () => {
    const detail = await getCardDetail("pokemon", "sv1-charizard-ex");

    expect(detail).toMatchObject({
      setName: expect.any(String),
      collectorNumber: expect.any(String),
      imageUrl: expect.any(String)
    });
    expect(detail.variations[0]).toMatchObject({
      id: expect.any(String),
      label: expect.any(String)
    });
  });
});
