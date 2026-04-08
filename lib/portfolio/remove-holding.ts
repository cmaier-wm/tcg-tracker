import { notFound } from "@/lib/api/http-errors";
import { prisma } from "@/lib/db/prisma";
import { withDatabaseFallback } from "@/lib/db/runtime";
import { requireAuthenticatedUser } from "@/lib/auth/auth-session";
import { getDemoUserState } from "@/lib/db/demo-store";
import { saveValuationSnapshot } from "@/lib/portfolio/save-valuation-snapshot";

export async function removeHolding(holdingId: string) {
  return withDatabaseFallback(
    async () => {
      const user = await requireAuthenticatedUser();
      const existing = await prisma.portfolioHolding.findUnique({
        where: { id: holdingId }
      });

      if (!existing || existing.userId !== user.userId) {
        throw notFound("Holding not found");
      }

      await prisma.portfolioHolding.delete({
        where: { id: holdingId }
      });

      await saveValuationSnapshot(user.userId);
    },
    async () => {
      const user = await requireAuthenticatedUser();
      const store = getDemoUserState(user.userId);
      const index = store.holdings.findIndex((item) => item.id === holdingId);

      if (index === -1) {
        throw notFound("Holding not found");
      }

      store.holdings.splice(index, 1);
      await saveValuationSnapshot(user.userId);
    }
  );
}
