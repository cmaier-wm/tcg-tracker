import { badRequest, notFound } from "@/lib/api/http-errors";
import { getDemoStore } from "@/lib/db/demo-store";
import { saveValuationSnapshot } from "@/lib/portfolio/save-valuation-snapshot";

export async function updateHolding(holdingId: string, quantity: number) {
  if (quantity < 1) {
    throw badRequest("Quantity must be greater than zero");
  }

  const store = getDemoStore();
  const holding = store.holdings.find((item) => item.id === holdingId);

  if (!holding) {
    throw notFound("Holding not found");
  }

  holding.quantity = quantity;
  await saveValuationSnapshot();

  return holding;
}

