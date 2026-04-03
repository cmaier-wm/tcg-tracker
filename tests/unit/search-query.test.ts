import { describe, expect, it } from "vitest";
import { matchesSearchTokens, tokenizeSearchQuery } from "@/lib/tcgtracking/search-query";

describe("search query helpers", () => {
  it("tokenizes search text", () => {
    expect(tokenizeSearchQuery("lugia 186")).toEqual(["lugia", "186"]);
  });

  it("matches card name and collector number tokens together", () => {
    expect(
      matchesSearchTokens(
        ["Lugia V (Alternate Full Art)", "SWSH12: Silver Tempest", "186/195"],
        ["lugia", "186"]
      )
    ).toBe(true);
  });
});
