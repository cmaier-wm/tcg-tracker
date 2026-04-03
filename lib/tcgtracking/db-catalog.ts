import { prisma } from "@/lib/db/prisma";
import { tokenizeSearchQuery } from "@/lib/tcgtracking/search-query";

export async function getDatabaseCardCatalog(options: {
  q?: string | null;
  category?: string | null;
  set?: string | null;
  limit?: number;
  offset?: number;
}) {
  const searchTokens = tokenizeSearchQuery(options.q);

  return prisma.card.findMany({
    where: {
      AND: searchTokens.length
        ? searchTokens.map((token) => ({
            OR: [
              {
                name: {
                  contains: token,
                  mode: "insensitive"
                }
              },
              {
                collectorNumber: {
                  contains: token,
                  mode: "insensitive"
                }
              },
              {
                set: {
                  name: {
                    contains: token,
                    mode: "insensitive"
                  }
                }
              }
            ]
          }))
        : undefined,
      set: {
        ...(options.set
          ? {
              OR: [
                {
                  name: {
                    equals: options.set.replace(/-/g, " "),
                    mode: "insensitive"
                  }
                },
                {
                  name: {
                    contains: options.set.replace(/-/g, " "),
                    mode: "insensitive"
                  }
                }
              ]
            }
          : undefined),
        category: {
          slug: options.category ?? undefined
        }
      }
    },
    include: {
      set: {
        include: {
          category: true
        }
      },
      variations: {
        include: {
          priceSnapshots: {
            orderBy: {
              capturedAt: "desc"
            },
            take: 1
          }
        }
      }
    },
    skip: options.offset,
    take: options.limit,
    orderBy: [{ set: { category: { name: "asc" } } }, { set: { name: "asc" } }, { name: "asc" }]
  });
}

export async function getDatabaseCardDetail(category: string, cardId: string) {
  return prisma.card.findFirst({
    where: {
      id: cardId,
      set: {
        category: {
          slug: category
        }
      }
    },
    include: {
      set: {
        include: {
          category: true
        }
      },
      variations: {
        include: {
          priceSnapshots: {
            orderBy: {
              capturedAt: "desc"
            },
            take: 1
          }
        },
        orderBy: [{ isDefault: "desc" }, { languageCode: "asc" }, { variantLabel: "asc" }]
      }
    }
  });
}

export async function getDatabaseVariationHistory(variationId: string) {
  return prisma.priceSnapshot.findMany({
    where: {
      cardVariationId: variationId
    },
    orderBy: {
      capturedAt: "asc"
    }
  });
}
