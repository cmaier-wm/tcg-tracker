import { withDatabaseFallback } from "@/lib/db/runtime";
import { getDemoCards, getDemoUserState } from "@/lib/db/demo-store";
import { prisma } from "@/lib/db/prisma";
import {
  requireAuthenticatedUser,
  type AuthenticatedUser
} from "@/lib/auth/auth-session";
import { getDatabasePortfolio } from "@/lib/portfolio/db-portfolio";
import {
  normalizePortfolioSort,
  sortPortfolioHoldings
} from "@/lib/portfolio/portfolio-sort";
import { valuePortfolio } from "@/lib/portfolio/value-portfolio";

export const portfolioPageSize = 5;

type GetPortfolioOptions = {
  sort?: string | null;
  page?: string | null;
  user?: AuthenticatedUser | null;
};

type GetPortfolioHoldingOptions = {
  user?: AuthenticatedUser | null;
};

export function normalizePortfolioPage(value?: string | null) {
  const page = Number.parseInt(value ?? "", 10);

  if (!Number.isFinite(page) || page < 1) {
    return 1;
  }

  return page;
}

function paginatePortfolioHoldings<T>(holdings: T[], page: number) {
  const totalItems = holdings.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / portfolioPageSize));
  const normalizedPage = Math.min(page, totalPages);
  const start = (normalizedPage - 1) * portfolioPageSize;

  return {
    items: holdings.slice(start, start + portfolioPageSize),
    page: normalizedPage,
    pageSize: portfolioPageSize,
    totalItems,
    totalPages
  };
}

export async function getPortfolio(options: GetPortfolioOptions = {}) {
  const sort = normalizePortfolioSort(options?.sort);
  const page = normalizePortfolioPage(options?.page);

  return withDatabaseFallback(
    async () => {
      const user = options.user ?? (await requireAuthenticatedUser());
      const holdings = await getDatabasePortfolio(user.userId);
      const mapped = holdings.map((holding) => {
        const estimatedValue =
          (holding.variation.priceSnapshots[0]?.marketPrice ?? 0) * holding.quantity;

        return {
          id: holding.id,
          cardVariationId: holding.cardVariationId,
          cardName: holding.variation.card.name,
          variationLabel: holding.variation.variantLabel,
          quantity: holding.quantity,
          estimatedValue,
          cardId: holding.variation.card.id,
          category: holding.variation.card.set.category.slug,
          imageUrl: holding.variation.card.imageUrl
        };
      });
      const sortedHoldings = sortPortfolioHoldings(mapped, sort);
      const paginatedHoldings = paginatePortfolioHoldings(sortedHoldings, page);

      return {
        holdings: paginatedHoldings.items,
        totalEstimatedValue: mapped.reduce(
          (total, holding) => total + holding.estimatedValue,
          0
        ),
        holdingCount: mapped.length,
        page: paginatedHoldings.page,
        pageSize: paginatedHoldings.pageSize,
        totalPages: paginatedHoldings.totalPages,
        totalItems: paginatedHoldings.totalItems
      };
    },
    async () => {
      const user = options.user ?? (await requireAuthenticatedUser());
      const store = getDemoUserState(user.userId);
      const valuation = valuePortfolio(store.holdings);
      const cardsByVariation = new Map(
        getDemoCards().flatMap((card) =>
          card.variations.map((variation) => [
            variation.id,
            {
              cardId: card.id,
              cardName: card.name,
              category: card.category,
              imageUrl: card.imageUrl
            }
          ])
        )
      );
      const sortedHoldings = sortPortfolioHoldings(
        valuation.holdings.map((holding) => ({
          ...holding,
          cardId: cardsByVariation.get(holding.cardVariationId)?.cardId ?? null,
          category: cardsByVariation.get(holding.cardVariationId)?.category ?? null,
          imageUrl: cardsByVariation.get(holding.cardVariationId)?.imageUrl ?? null
        })),
        sort
      );
      const paginatedHoldings = paginatePortfolioHoldings(sortedHoldings, page);

      return {
        holdings: paginatedHoldings.items,
        totalEstimatedValue: valuation.totalEstimatedValue,
        holdingCount: valuation.holdingCount,
        page: paginatedHoldings.page,
        pageSize: paginatedHoldings.pageSize,
        totalPages: paginatedHoldings.totalPages,
        totalItems: paginatedHoldings.totalItems
      };
    }
  );
}

export async function getPortfolioHoldingByVariationId(
  cardVariationId: string,
  options: GetPortfolioHoldingOptions = {}
) {
  return withDatabaseFallback(
    async () => {
      const user = options.user ?? (await requireAuthenticatedUser());

      return prisma.portfolioHolding.findUnique({
        where: {
          userId_cardVariationId: {
            userId: user.userId,
            cardVariationId
          }
        },
        select: {
          id: true,
          cardVariationId: true,
          quantity: true
        }
      });
    },
    async () => {
      const user = options.user ?? (await requireAuthenticatedUser());
      const store = getDemoUserState(user.userId);

      return (
        store.holdings.find((holding) => holding.cardVariationId === cardVariationId) ?? null
      );
    }
  );
}
