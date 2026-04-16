import { badRequest, notFound } from "@/lib/api/http-errors";
import { prisma } from "@/lib/db/prisma";
import { withDatabaseFallback } from "@/lib/db/runtime";
import { requireAuthenticatedUser } from "@/lib/auth/auth-session";
import { getDemoCards, getDemoUserState } from "@/lib/db/demo-store";
import { saveValuationSnapshot } from "@/lib/portfolio/save-valuation-snapshot";
import { valuePortfolio } from "@/lib/portfolio/value-portfolio";

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
      const hydratedHolding = await prisma.portfolioHolding.findUniqueOrThrow({
        where: {
          id: holding.id
        },
        include: {
          variation: {
            include: {
              card: {
                include: {
                  set: {
                    include: {
                      category: true
                    }
                  }
                }
              },
              priceSnapshots: {
                orderBy: {
                  capturedAt: "desc"
                },
                take: 1
              }
            }
          }
        }
      });

      return {
        id: hydratedHolding.id,
        cardVariationId: hydratedHolding.cardVariationId,
        cardName: hydratedHolding.variation.card.name,
        variationLabel: hydratedHolding.variation.variantLabel,
        quantity: hydratedHolding.quantity,
        estimatedValue:
          (hydratedHolding.variation.priceSnapshots[0]?.marketPrice ?? 0) *
          hydratedHolding.quantity,
        cardId: hydratedHolding.variation.card.id,
        category: hydratedHolding.variation.card.set.category.slug,
        imageUrl: hydratedHolding.variation.card.imageUrl
      };
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
          quantity,
          createdAt: new Date().toISOString()
        });
      }

      await saveValuationSnapshot(user.userId);
      const valuation = valuePortfolio(store.holdings);
      const addedHolding = valuation.holdings.find(
        (holding) => holding.cardVariationId === cardVariationId
      );
      const card = getDemoCards().find((candidate) =>
        candidate.variations.some((variation) => variation.id === cardVariationId)
      );

      if (!addedHolding || !card) {
        throw notFound("Card variation not found");
      }

      return {
        ...addedHolding,
        cardId: card.id,
        category: card.category,
        imageUrl: card.imageUrl ?? null
      };
    }
  );
}
