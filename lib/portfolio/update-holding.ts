import { badRequest, notFound } from "@/lib/api/http-errors";
import { prisma } from "@/lib/db/prisma";
import { withDatabaseFallback } from "@/lib/db/runtime";
import { requireAuthenticatedUser } from "@/lib/auth/auth-session";
import { getDemoUserState } from "@/lib/db/demo-store";
import { saveValuationSnapshot } from "@/lib/portfolio/save-valuation-snapshot";

export async function updateHolding(holdingId: string, quantity: number) {
  if (quantity < 1) {
    throw badRequest("Quantity must be greater than zero");
  }

  return withDatabaseFallback(
    async () => {
      const user = await requireAuthenticatedUser();
      const existing = await prisma.portfolioHolding.findUnique({
        where: { id: holdingId }
      });

      if (!existing || existing.userId !== user.userId) {
        throw notFound("Holding not found");
      }

      const updated = await prisma.portfolioHolding.update({
        where: { id: holdingId },
        data: { quantity }
      });

      await saveValuationSnapshot(user.userId);
      return updated;
    },
    async () => {
      const user = await requireAuthenticatedUser();
      const store = getDemoUserState(user.userId);
      const holding = store.holdings.find((item) => item.id === holdingId);

      if (!holding) {
        throw notFound("Holding not found");
      }

      holding.quantity = quantity;
      await saveValuationSnapshot(user.userId);

      return holding;
    }
  );
}
