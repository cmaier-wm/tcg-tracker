import { describe, expect, it } from "vitest";
import { isCodeCard } from "@/lib/tcgtracking/code-card";

describe("code card detection", () => {
  it("matches catalog entries explicitly labeled as code cards", () => {
    expect(
      isCodeCard({
        name: "Perfect Order Booster Pack",
        rarity: "Code Card"
      })
    ).toBe(true);
  });

  it("matches code card names even when rarity is missing", () => {
    expect(
      isCodeCard({
        name: "Code Card - Mega Evolution Booster Pack"
      })
    ).toBe(true);
  });

  it("does not hide non-code cards that merely contain similar words", () => {
    expect(
      isCodeCard({
        name: "Fugitive Codebreaker",
        cleanName: "Secrets of Strixhaven Codex Bundle",
        rarity: "Rare"
      })
    ).toBe(false);
  });
});
