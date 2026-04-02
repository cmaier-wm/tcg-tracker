import { notFound } from "@/lib/api/http-errors";
import { getDemoStore } from "@/lib/db/demo-store";
import { saveValuationSnapshot } from "@/lib/portfolio/save-valuation-snapshot";

export async function removeHolding(holdingId: string) {
  const store = getDemoStore();
  const index = store.holdings.findIndex((item) => item.id === holdingId);

  if (index === -1) {
    throw notFound("Holding not found");
  }

  store.holdings.splice(index, 1);
  await saveValuationSnapshot();
}

