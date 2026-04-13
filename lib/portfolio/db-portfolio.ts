import { prisma } from "@/lib/db/prisma";
import { requireAuthenticatedUser } from "@/lib/auth/auth-session";

export async function getAuthenticatedUserAccount() {
  const sessionUser = await requireAuthenticatedUser();

  return prisma.userAccount.findUniqueOrThrow({
    where: { id: sessionUser.userId }
  });
}

export async function getDatabasePortfolio(userId: string) {
  return prisma.portfolioHolding.findMany({
    where: {
      userId
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
    },
    orderBy: {
      createdAt: "asc"
    }
  });
}

export async function getDatabasePortfolioHistory() {
  const user = await requireAuthenticatedUser();

  return prisma.portfolioValuationSnapshot.findMany({
    where: {
      userId: user.userId
    },
    orderBy: {
      capturedAt: "asc"
    }
  });
}
