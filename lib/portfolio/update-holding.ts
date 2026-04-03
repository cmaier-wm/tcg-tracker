import { badRequest, notFound } from "@/lib/api/http-errors";
import { prisma } from "@/lib/db/prisma";
import { withDatabaseFallback } from "@/lib/db/runtime";
import { getDemoStore } from "@/lib/db/demo-store";
import { saveValuationSnapshot } from "@/lib/portfolio/save-valuation-snapshot";

export async function updateHolding(holdingId: string, quantity: number) {
  if (quantity < 1) {
    throw badRequest("Quantity must be greater than zero");
  }

  return withDatabaseFallback(
    async () => {
      const existing = await prisma.portfolioHolding.findUnique({
        where: { id: holdingId }
      });

      if (!existing) {
        throw notFound("Holding not found");
      }

      const updated = await prisma.portfolioHolding.update({
        where: { id: holdingId },
        data: { quantity }
      });

      await saveValuationSnapshot();
      return updated;
    },
    async () => {
      const store = getDemoStore();
      const holding = store.holdings.find((item) => item.id === holdingId);

      if (!holding) {
        throw notFound("Holding not found");
      }

      holding.quantity = quantity;
      await saveValuationSnapshot();

      return holding;
    }
  );
}
