import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { CatalogSortValue } from "@/lib/tcgtracking/search-query";
import { tokenizeSearchQuery } from "@/lib/tcgtracking/search-query";

const rarityRankSql = Prisma.sql`
  CASE
    WHEN c.rarity IS NULL OR BTRIM(c.rarity) = '' THEN NULL
    WHEN LOWER(c.rarity) = 'common' THEN 0
    WHEN LOWER(c.rarity) = 'uncommon' THEN 1
    WHEN LOWER(c.rarity) IN ('rare holo', 'holo rare', 'rare') THEN 2
    WHEN LOWER(c.rarity) = 'legendary' THEN 3
    WHEN LOWER(c.rarity) = 'double rare' THEN 4
    WHEN LOWER(c.rarity) = 'ultra rare' THEN 5
    WHEN LOWER(c.rarity) = 'illustration rare' THEN 6
    WHEN LOWER(c.rarity) = 'special illustration rare' THEN 7
    WHEN LOWER(c.rarity) = 'secret rare' THEN 8
    WHEN LOWER(c.rarity) = 'hyper rare' THEN 9
    WHEN LOWER(c.rarity) = 'alternate art' THEN 10
    WHEN LOWER(c.rarity) LIKE '%common%' THEN 0
    WHEN LOWER(c.rarity) LIKE '%uncommon%' THEN 1
    WHEN LOWER(c.rarity) LIKE '%rare holo%' THEN 2
    WHEN LOWER(c.rarity) LIKE '%holo rare%' THEN 2
    WHEN LOWER(c.rarity) LIKE '%rare%' THEN 2
    WHEN LOWER(c.rarity) LIKE '%legendary%' THEN 3
    WHEN LOWER(c.rarity) LIKE '%double rare%' THEN 4
    WHEN LOWER(c.rarity) LIKE '%ultra rare%' THEN 5
    WHEN LOWER(c.rarity) LIKE '%illustration rare%' THEN 6
    WHEN LOWER(c.rarity) LIKE '%special illustration rare%' THEN 7
    WHEN LOWER(c.rarity) LIKE '%secret rare%' THEN 8
    WHEN LOWER(c.rarity) LIKE '%hyper rare%' THEN 9
    WHEN LOWER(c.rarity) LIKE '%alternate art%' THEN 10
    ELSE NULL
  END
`;

const collectorNumberRankSql = Prisma.sql`
  CASE
    WHEN c."collectorNumber" IS NULL THEN NULL
    ELSE NULLIF(SUBSTRING(c."collectorNumber" FROM '^[0-9]+'), '')::int
  END
`;

function getCatalogOrderSql(sort: CatalogSortValue) {
  const tieBreakers = Prisma.sql`
    LOWER(c.name) ASC,
    LOWER(s.name) ASC,
    ${collectorNumberRankSql} ASC NULLS LAST,
    c."collectorNumber" ASC NULLS LAST,
    ${rarityRankSql} ASC NULLS LAST,
    LOWER(c.rarity) ASC NULLS LAST,
    c."currentPrice" DESC NULLS LAST,
    c.id ASC
  `;

  switch (sort) {
    case "price-asc":
      return Prisma.sql`ORDER BY c."currentPrice" ASC NULLS LAST, ${tieBreakers}`;
    case "price-desc":
      return Prisma.sql`ORDER BY c."currentPrice" DESC NULLS LAST, ${tieBreakers}`;
    case "name-asc":
      return Prisma.sql`ORDER BY LOWER(c.name) ASC, ${tieBreakers}`;
    case "name-desc":
      return Prisma.sql`ORDER BY LOWER(c.name) DESC, ${tieBreakers}`;
    case "number-asc":
      return Prisma.sql`
        ORDER BY
          ${collectorNumberRankSql} ASC NULLS LAST,
          c."collectorNumber" ASC NULLS LAST,
          ${tieBreakers}
      `;
    case "number-desc":
      return Prisma.sql`
        ORDER BY
          ${collectorNumberRankSql} DESC NULLS LAST,
          c."collectorNumber" DESC NULLS LAST,
          ${tieBreakers}
      `;
    case "set-asc":
      return Prisma.sql`ORDER BY LOWER(s.name) ASC, ${tieBreakers}`;
    case "set-desc":
      return Prisma.sql`ORDER BY LOWER(s.name) DESC, ${tieBreakers}`;
    case "rarity-asc":
      return Prisma.sql`
        ORDER BY
          ${rarityRankSql} ASC NULLS LAST,
          LOWER(c.rarity) ASC NULLS LAST,
          ${tieBreakers}
      `;
    case "rarity-desc":
      return Prisma.sql`
        ORDER BY
          ${rarityRankSql} DESC NULLS LAST,
          LOWER(c.rarity) DESC NULLS LAST,
          ${tieBreakers}
      `;
  }
}

export async function getDatabaseCardCatalog(options: {
  q?: string | null;
  category?: string | null;
  set?: string | null;
  sort: CatalogSortValue;
  limit?: number;
  offset?: number;
}) {
  const searchTokens = tokenizeSearchQuery(options.q);
  const whereClauses: Prisma.Sql[] = [];

  if (options.category) {
    whereClauses.push(Prisma.sql`cc.slug = ${options.category}`);
  }

  if (options.set) {
    const normalizedSet = options.set.replace(/-/g, " ");
    const setPattern = `%${normalizedSet}%`;

    whereClauses.push(
      Prisma.sql`(s.name ILIKE ${normalizedSet} OR s.name ILIKE ${setPattern})`
    );
  }

  for (const token of searchTokens) {
    const tokenPattern = `%${token}%`;

    whereClauses.push(
      Prisma.sql`(
        c.name ILIKE ${tokenPattern}
        OR c."collectorNumber" ILIKE ${tokenPattern}
        OR s.name ILIKE ${tokenPattern}
      )`
    );
  }

  const whereSql =
    whereClauses.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(whereClauses, " AND ")}`
      : Prisma.empty;
  const orderSql = getCatalogOrderSql(options.sort);
  const offsetSql =
    options.offset && options.offset > 0
      ? Prisma.sql`OFFSET ${options.offset}`
      : Prisma.empty;
  const limitSql =
    options.limit && options.limit > 0 ? Prisma.sql`LIMIT ${options.limit}` : Prisma.empty;

  return prisma.$queryRaw<
    Array<{
      id: string;
      category: string;
      categoryName: string;
      setName: string;
      name: string;
      collectorNumber: string | null;
      rarity: string | null;
      imageUrl: string | null;
      currentPrice: number | null;
      variationCount: number;
    }>
  >(Prisma.sql`
    SELECT
      c.id,
      cc.slug AS category,
      cc.name AS "categoryName",
      s.name AS "setName",
      c.name,
      c."collectorNumber",
      c.rarity,
      c."imageUrl",
      c."currentPrice",
      c."variationCount"
    FROM "Card" c
    INNER JOIN "CardSet" s ON s.id = c."setId"
    INNER JOIN "CardCategory" cc ON cc.id = s."categoryId"
    ${whereSql}
    ${orderSql}
    ${offsetSql}
    ${limitSql}
  `);
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
    select: {
      id: true,
      name: true,
      collectorNumber: true,
      rarity: true,
      imageUrl: true,
      set: {
        select: {
          name: true,
          category: true
        }
      },
      variations: {
        where: {
          OR: [
            {
              languageCode: null
            },
            {
              languageCode: {
                equals: "en",
                mode: "insensitive"
              }
            }
          ]
        },
        select: {
          id: true,
          variantLabel: true,
          languageCode: true,
          finish: true,
          conditionCode: true,
          isDefault: true,
          priceSnapshots: {
            orderBy: {
              capturedAt: "desc"
            },
            take: 1,
            select: {
              marketPrice: true,
              capturedAt: true
            }
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
      cardVariationId: variationId,
      marketPrice: {
        not: null
      }
    },
    select: {
      capturedAt: true,
      marketPrice: true
    },
    orderBy: {
      capturedAt: "asc"
    }
  });
}
