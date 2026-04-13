import { prisma } from "@/lib/db/prisma";
import { tokenizeSearchQuery } from "@/lib/tcgtracking/search-query";

export async function getDatabaseCardCatalog(options: {
  q?: string | null;
  category?: string | null;
  set?: string | null;
  sort?: string | null;
  limit?: number;
  offset?: number;
}) {
  const searchTokens = tokenizeSearchQuery(options.q);
  const whereClauses: string[] = [];
  const parameters: Array<string | number> = [];
  const offset = Math.max(0, options.offset ?? 0);
  const limit = options.limit != null ? Math.max(1, options.limit) : null;

  if (options.category) {
    parameters.push(options.category);
    whereClauses.push(`cc.slug = $${parameters.length}`);
  }

  if (options.set) {
    const normalizedSet = options.set.replace(/-/g, " ");
    const setPattern = `%${normalizedSet}%`;

    parameters.push(normalizedSet, setPattern);
    whereClauses.push(
      `(s.name ILIKE $${parameters.length - 1} OR s.name ILIKE $${parameters.length})`
    );
  }

  for (const token of searchTokens) {
    const tokenPattern = `%${token}%`;

    parameters.push(tokenPattern, tokenPattern, tokenPattern);
    whereClauses.push(
      `(
        c.name ILIKE $${parameters.length - 2}
        OR c."collectorNumber" ILIKE $${parameters.length - 1}
        OR s.name ILIKE $${parameters.length}
      )`
    );
  }

  const whereSql =
    whereClauses.length > 0
      ? `WHERE ${whereClauses.join(" AND ")}`
      : "";

  const rarityRankSql = `
    CASE
      WHEN fc.rarity IS NULL OR BTRIM(fc.rarity) = '' THEN NULL
      WHEN LOWER(fc.rarity) = 'common' THEN 0
      WHEN LOWER(fc.rarity) = 'uncommon' THEN 1
      WHEN LOWER(fc.rarity) = 'rare holo' THEN 2
      WHEN LOWER(fc.rarity) = 'holo rare' THEN 2
      WHEN LOWER(fc.rarity) = 'rare' THEN 2
      WHEN LOWER(fc.rarity) = 'legendary' THEN 3
      WHEN LOWER(fc.rarity) = 'double rare' THEN 4
      WHEN LOWER(fc.rarity) = 'ultra rare' THEN 5
      WHEN LOWER(fc.rarity) = 'illustration rare' THEN 6
      WHEN LOWER(fc.rarity) = 'special illustration rare' THEN 7
      WHEN LOWER(fc.rarity) = 'secret rare' THEN 8
      WHEN LOWER(fc.rarity) = 'hyper rare' THEN 9
      WHEN LOWER(fc.rarity) = 'alternate art' THEN 10
      WHEN LOWER(fc.rarity) LIKE '%common%' THEN 0
      WHEN LOWER(fc.rarity) LIKE '%uncommon%' THEN 1
      WHEN LOWER(fc.rarity) LIKE '%rare holo%' THEN 2
      WHEN LOWER(fc.rarity) LIKE '%holo rare%' THEN 2
      WHEN LOWER(fc.rarity) LIKE '%rare%' THEN 2
      WHEN LOWER(fc.rarity) LIKE '%legendary%' THEN 3
      WHEN LOWER(fc.rarity) LIKE '%double rare%' THEN 4
      WHEN LOWER(fc.rarity) LIKE '%ultra rare%' THEN 5
      WHEN LOWER(fc.rarity) LIKE '%illustration rare%' THEN 6
      WHEN LOWER(fc.rarity) LIKE '%special illustration rare%' THEN 7
      WHEN LOWER(fc.rarity) LIKE '%secret rare%' THEN 8
      WHEN LOWER(fc.rarity) LIKE '%hyper rare%' THEN 9
      WHEN LOWER(fc.rarity) LIKE '%alternate art%' THEN 10
      ELSE NULL
    END
  `;

  const collectorNumberSortSql = `
    CASE
      WHEN fc."collectorNumber" IS NULL OR BTRIM(fc."collectorNumber") = '' THEN NULL
      ELSE LOWER(fc."collectorNumber")
    END
  `;

  const orderSql =
    options.sort === "price-asc"
      ? `ORDER BY
          vs."currentPrice" ASC NULLS LAST,
          fc.name ASC,
          fc."setName" ASC,
          ${collectorNumberSortSql} ASC NULLS LAST,
          ${rarityRankSql} ASC NULLS LAST,
          LOWER(fc.rarity) ASC NULLS LAST,
          fc.id ASC`
      : options.sort === "name-asc"
        ? `ORDER BY
            fc.name ASC,
            fc."setName" ASC,
            ${collectorNumberSortSql} ASC NULLS LAST,
            ${rarityRankSql} ASC NULLS LAST,
            LOWER(fc.rarity) ASC NULLS LAST,
            vs."currentPrice" DESC NULLS LAST,
            fc.id ASC`
        : options.sort === "name-desc"
          ? `ORDER BY
              fc.name DESC,
              fc."setName" ASC,
              ${collectorNumberSortSql} ASC NULLS LAST,
              ${rarityRankSql} ASC NULLS LAST,
              LOWER(fc.rarity) ASC NULLS LAST,
              vs."currentPrice" DESC NULLS LAST,
              fc.id ASC`
          : options.sort === "number-asc"
            ? `ORDER BY
                ${collectorNumberSortSql} ASC NULLS LAST,
                fc.name ASC,
                fc."setName" ASC,
                ${rarityRankSql} ASC NULLS LAST,
                LOWER(fc.rarity) ASC NULLS LAST,
                vs."currentPrice" DESC NULLS LAST,
                fc.id ASC`
            : options.sort === "number-desc"
              ? `ORDER BY
                  ${collectorNumberSortSql} DESC NULLS LAST,
                  fc.name ASC,
                  fc."setName" ASC,
                  ${rarityRankSql} ASC NULLS LAST,
                  LOWER(fc.rarity) ASC NULLS LAST,
                  vs."currentPrice" DESC NULLS LAST,
                  fc.id ASC`
              : options.sort === "set-asc"
                ? `ORDER BY
                    fc."setName" ASC,
                    fc.name ASC,
                    ${collectorNumberSortSql} ASC NULLS LAST,
                    ${rarityRankSql} ASC NULLS LAST,
                    LOWER(fc.rarity) ASC NULLS LAST,
                    vs."currentPrice" DESC NULLS LAST,
                    fc.id ASC`
                : options.sort === "set-desc"
                  ? `ORDER BY
                      fc."setName" DESC,
                      fc.name ASC,
                      ${collectorNumberSortSql} ASC NULLS LAST,
                      ${rarityRankSql} ASC NULLS LAST,
                      LOWER(fc.rarity) ASC NULLS LAST,
                      vs."currentPrice" DESC NULLS LAST,
                      fc.id ASC`
                  : options.sort === "rarity-asc"
                    ? `ORDER BY
                        ${rarityRankSql} ASC NULLS LAST,
                        LOWER(fc.rarity) ASC NULLS LAST,
                        fc.name ASC,
                        fc."setName" ASC,
                        ${collectorNumberSortSql} ASC NULLS LAST,
                        vs."currentPrice" DESC NULLS LAST,
                        fc.id ASC`
                    : options.sort === "rarity-desc"
                      ? `ORDER BY
                          ${rarityRankSql} DESC NULLS LAST,
                          LOWER(fc.rarity) DESC NULLS LAST,
                          fc.name ASC,
                          fc."setName" ASC,
                          ${collectorNumberSortSql} ASC NULLS LAST,
                          vs."currentPrice" DESC NULLS LAST,
                          fc.id ASC`
                      : `ORDER BY
                          vs."currentPrice" DESC NULLS LAST,
                          fc.name ASC,
                          fc."setName" ASC,
                          ${collectorNumberSortSql} ASC NULLS LAST,
                          ${rarityRankSql} ASC NULLS LAST,
                          LOWER(fc.rarity) ASC NULLS LAST,
                          fc.id ASC`;

  const paginationSql =
    limit == null ? `OFFSET ${offset}` : `LIMIT ${limit} OFFSET ${offset}`;

  return prisma.$queryRawUnsafe<
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
  >(
    `
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
    ${orderSql}
    ${paginationSql}
  `,
    ...parameters
  );
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
