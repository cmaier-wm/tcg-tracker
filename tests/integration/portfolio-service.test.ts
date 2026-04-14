import { beforeEach, describe, expect, it } from "vitest";
import { getDemoUserState, resetDemoStore } from "@/lib/db/demo-store";
import { POST } from "@/app/api/portfolio/route";
import { setTestAuthenticatedUser } from "@/lib/auth/auth-session";
import { addHolding } from "@/lib/portfolio/add-holding";
import { getPortfolio } from "@/lib/portfolio/get-portfolio";

describe("portfolio service", () => {
  beforeEach(() => {
    resetDemoStore();
    setTestAuthenticatedUser(undefined);
  });

  it("adds a holding and reflects it in the portfolio", async () => {
    await addHolding("onepiece-luffy-en-foil", 1);
    const portfolio = await getPortfolio();

    expect(
      portfolio.holdings.some((holding) => holding.cardVariationId === "onepiece-luffy-en-foil")
    ).toBe(true);
  });

  it("sorts portfolio holdings by highest value first by default", async () => {
    await addHolding("lorcana-belle-en-coldfoil", 1);
    await addHolding("sv1-charizard-ex-en-nm-holo", 1);
    await addHolding("onepiece-luffy-en-foil", 1);

    const portfolio = await getPortfolio({ sort: "price-desc" });

    expect(portfolio.holdings.map((holding) => holding.cardVariationId)).toEqual([
      "onepiece-luffy-en-foil",
      "sv1-charizard-ex-en-nm-holo",
      "lorcana-belle-en-coldfoil"
    ]);
  });

  it("paginates holdings to five items per page", async () => {
    const store = getDemoUserState("demo-user");

    store.holdings.splice(0, store.holdings.length, ...[
      { id: "holding-1", cardVariationId: "onepiece-luffy-en-foil", quantity: 1 },
      { id: "holding-2", cardVariationId: "sv1-charizard-ex-en-nm-holo", quantity: 1 },
      { id: "holding-3", cardVariationId: "lorcana-belle-en-coldfoil", quantity: 1 },
      { id: "holding-4", cardVariationId: "sv1-charizard-ex-jp-nm-holo", quantity: 1 },
      { id: "holding-5", cardVariationId: "onepiece-luffy-en-foil", quantity: 2 },
      { id: "holding-6", cardVariationId: "lorcana-belle-en-coldfoil", quantity: 3 }
    ]);

    const firstPage = await getPortfolio({ sort: "price-desc", page: "1" });
    const secondPage = await getPortfolio({ sort: "price-desc", page: "2" });

    expect(firstPage.holdings).toHaveLength(5);
    expect(firstPage.page).toBe(1);
    expect(firstPage.totalPages).toBe(2);
    expect(secondPage.holdings).toHaveLength(1);
    expect(secondPage.page).toBe(2);
  });

  it("rejects portfolio writes when the current session is missing", async () => {
    setTestAuthenticatedUser(null);

    const response = await POST(
      new Request("http://localhost/api/portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          cardVariationId: "onepiece-luffy-en-foil",
          quantity: 1
        })
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error).toBe("Authentication is required.");
  });

  it("refreshes computed totals after add, update, and remove operations", async () => {
    const created = await addHolding("sv1-charizard-ex-en-nm-holo", 1);
    let portfolio = await getPortfolio();
    const initialTotal = portfolio.totalEstimatedValue;

    expect(initialTotal).toBeGreaterThan(0);

    const { PATCH, DELETE } = await import("@/app/api/portfolio/[holdingId]/route");

    await PATCH(
      new Request(`http://localhost/api/portfolio/${created.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: 2 })
      }),
      { params: Promise.resolve({ holdingId: created.id }) }
    );

    portfolio = await getPortfolio();
    expect(portfolio.totalEstimatedValue).toBeGreaterThan(initialTotal);

    const deleteResponse = await DELETE(
      new Request(`http://localhost/api/portfolio/${created.id}`),
      {
        params: Promise.resolve({ holdingId: created.id })
      }
    );

    expect(deleteResponse.status).toBe(204);
    portfolio = await getPortfolio();
    expect(portfolio.holdings.some((holding) => holding.id === created.id)).toBe(false);
  });
});
