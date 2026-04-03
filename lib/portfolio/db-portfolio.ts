import { prisma } from "@/lib/db/prisma";

export async function getOrCreateDefaultUser() {
  return prisma.userAccount.upsert({
    where: { email: "collector@local.tcg" },
    update: {},
    create: {
      id: "demo-user",
      email: "collector@local.tcg",
      displayName: "Collector"
    }
  });
}

export async function getDatabasePortfolio() {
  const user = await getOrCreateDefaultUser();

  return prisma.portfolioHolding.findMany({
    where: {
      userId: user.id
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
  const user = await getOrCreateDefaultUser();

  return prisma.portfolioValuationSnapshot.findMany({
    where: {
      userId: user.id
    },
    orderBy: {
      capturedAt: "asc"
    }
  });
}

