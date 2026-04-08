import { badRequest, notFound } from "@/lib/api/http-errors";
import { prisma } from "@/lib/db/prisma";
import { withDatabaseFallback } from "@/lib/db/runtime";
import { requireAuthenticatedUser } from "@/lib/auth/auth-session";
import { getDemoCards, getDemoUserState } from "@/lib/db/demo-store";
import { saveValuationSnapshot } from "@/lib/portfolio/save-valuation-snapshot";

export async function addHolding(cardVariationId: string, quantity: number) {
  if (quantity < 1) {
    throw badRequest("Quantity must be greater than zero");
  }

  return withDatabaseFallback(
    async () => {
      const user = await requireAuthenticatedUser();
      const variation = await prisma.cardVariation.findUnique({
        where: { id: cardVariationId }
      });

      if (!variation) {
        throw notFound("Card variation not found");
      }

      const holding = await prisma.portfolioHolding.upsert({
        where: {
          userId_cardVariationId: {
            userId: user.userId,
            cardVariationId
          }
        },
        update: {
          quantity: {
            increment: quantity
          }
        },
        create: {
          userId: user.userId,
          cardVariationId,
          quantity
        }
      });

      await saveValuationSnapshot(user.userId);
      return holding;
    },
    async () => {
      const user = await requireAuthenticatedUser();
      const store = getDemoUserState(user.userId);
      const variationExists = getDemoCards()
        .flatMap((card) => card.variations)
        .some((variation) => variation.id === cardVariationId);

      if (!variationExists) {
        throw notFound("Card variation not found");
      }

      const existing = store.holdings.find((holding) => holding.cardVariationId === cardVariationId);

      if (existing) {
        existing.quantity += quantity;
      } else {
        store.holdings.push({
          id: `holding-${Math.random().toString(36).slice(2, 9)}`,
          cardVariationId,
          quantity
        });
      }

      await saveValuationSnapshot(user.userId);
      return store.holdings.find((holding) => holding.cardVariationId === cardVariationId);
    }
  );
}
