import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { tokenizeSearchQuery } from "@/lib/tcgtracking/search-query";

export async function getDatabaseCardCatalog(options: {
  q?: string | null;
  category?: string | null;
  set?: string | null;
  sort?: string | null;
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
    WITH filtered_cards AS (
      SELECT
        c.id,
        c.name,
        c."collectorNumber",
        c.rarity,
        c."imageUrl",
        s.name AS "setName",
        cc.slug AS category,
        cc.name AS "categoryName"
      FROM "Card" c
      INNER JOIN "CardSet" s ON s.id = c."setId"
      INNER JOIN "CardCategory" cc ON cc.id = s."categoryId"
      ${whereSql}
    ),
    latest_snapshots AS (
      SELECT DISTINCT ON (ps."cardVariationId")
        ps."cardVariationId",
        ps."marketPrice"
      FROM "PriceSnapshot" ps
      INNER JOIN "CardVariation" cv ON cv.id = ps."cardVariationId"
      INNER JOIN filtered_cards fc ON fc.id = cv."cardId"
      ORDER BY ps."cardVariationId", ps."capturedAt" DESC
    ),
    variation_stats AS (
      SELECT
        cv."cardId",
        COUNT(*)::int AS "variationCount",
        (
          ARRAY_AGG(
            ls."marketPrice"::double precision
            ORDER BY
              CASE
                WHEN LOWER(COALESCE(cv."languageCode", '')) = 'en'
                  AND ls."marketPrice" IS NOT NULL THEN 0
                WHEN COALESCE(cv."languageCode", '') = ''
                  AND ls."marketPrice" IS NOT NULL THEN 1
                WHEN ls."marketPrice" IS NOT NULL THEN 2
                WHEN LOWER(COALESCE(cv."languageCode", '')) = 'en' THEN 3
                WHEN COALESCE(cv."languageCode", '') = '' THEN 4
                ELSE 5
              END,
              CASE
                WHEN UPPER(COALESCE(cv."conditionCode", '')) = 'NM' THEN 0
                WHEN UPPER(COALESCE(cv."conditionCode", '')) = 'LP' THEN 1
                WHEN UPPER(COALESCE(cv."conditionCode", '')) = 'MP' THEN 2
                WHEN UPPER(COALESCE(cv."conditionCode", '')) = 'HP' THEN 3
                WHEN UPPER(COALESCE(cv."conditionCode", '')) = 'DMG' THEN 4
                WHEN cv."conditionCode" IS NULL THEN 5
                ELSE 6
              END,
              CASE WHEN cv."isDefault" THEN 0 ELSE 1 END,
              ls."marketPrice" DESC NULLS LAST,
              cv.id ASC
          )
        )[1] AS "currentPrice"
      FROM "CardVariation" cv
      INNER JOIN filtered_cards fc ON fc.id = cv."cardId"
      LEFT JOIN latest_snapshots ls ON ls."cardVariationId" = cv.id
      GROUP BY cv."cardId"
    )
    SELECT
      fc.id,
      fc.category,
      fc."categoryName",
      fc."setName",
      fc.name,
      fc."collectorNumber",
      fc.rarity,
      fc."imageUrl",
      vs."currentPrice",
      COALESCE(vs."variationCount", 0)::int AS "variationCount"
    FROM filtered_cards fc
    LEFT JOIN variation_stats vs ON vs."cardId" = fc.id
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
