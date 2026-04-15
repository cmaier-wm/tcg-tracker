import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

type RefreshCardCatalogMetricsOptions = {
  cardIds?: string[];
  setIds?: string[];
};

function getTargetCardsWhereSql(options: RefreshCardCatalogMetricsOptions) {
  const hasCardIds = Boolean(options.cardIds?.length);
  const hasSetIds = Boolean(options.setIds?.length);

  if (hasCardIds && hasSetIds) {
    return Prisma.sql`
      WHERE c.id IN (${Prisma.join(options.cardIds!)})
        AND c."setId" IN (${Prisma.join(options.setIds!)})
    `;
  }

  if (hasCardIds) {
    return Prisma.sql`WHERE c.id IN (${Prisma.join(options.cardIds!)})`;
  }

  if (hasSetIds) {
    return Prisma.sql`WHERE c."setId" IN (${Prisma.join(options.setIds!)})`;
  }

  return Prisma.empty;
}

const variationLanguageRankSql = Prisma.sql`
  CASE
    WHEN LOWER(COALESCE(cv."languageCode", '')) = 'en' AND ls."marketPrice" IS NOT NULL THEN 0
    WHEN COALESCE(cv."languageCode", '') = '' AND ls."marketPrice" IS NOT NULL THEN 1
    WHEN ls."marketPrice" IS NOT NULL THEN 2
    WHEN LOWER(COALESCE(cv."languageCode", '')) = 'en' THEN 3
    WHEN COALESCE(cv."languageCode", '') = '' THEN 4
    ELSE 5
  END
`;

const variationConditionRankSql = Prisma.sql`
  CASE
    WHEN UPPER(COALESCE(cv."conditionCode", '')) = 'NM' THEN 0
    WHEN UPPER(COALESCE(cv."conditionCode", '')) = 'LP' THEN 1
    WHEN UPPER(COALESCE(cv."conditionCode", '')) = 'MP' THEN 2
    WHEN UPPER(COALESCE(cv."conditionCode", '')) = 'HP' THEN 3
    WHEN UPPER(COALESCE(cv."conditionCode", '')) = 'DMG' THEN 4
    WHEN cv."conditionCode" IS NULL THEN 5
    ELSE 6
  END
`;

export async function refreshCardCatalogMetrics(
  options: RefreshCardCatalogMetricsOptions = {}
) {
  const targetCardsWhereSql = getTargetCardsWhereSql(options);

  await prisma.$executeRaw(Prisma.sql`
    WITH target_cards AS (
      SELECT c.id
      FROM "Card" c
      ${targetCardsWhereSql}
    ),
    latest_snapshots AS (
      SELECT DISTINCT ON (ps."cardVariationId")
        ps."cardVariationId",
        ps."marketPrice"
      FROM "PriceSnapshot" ps
      INNER JOIN "CardVariation" cv ON cv.id = ps."cardVariationId"
      INNER JOIN target_cards tc ON tc.id = cv."cardId"
      ORDER BY ps."cardVariationId", ps."capturedAt" DESC
    ),
    ranked_variations AS (
      SELECT
        cv."cardId",
        ls."marketPrice"::double precision AS "currentPrice",
        COUNT(*) OVER (PARTITION BY cv."cardId")::int AS "variationCount",
        ROW_NUMBER() OVER (
          PARTITION BY cv."cardId"
          ORDER BY
            ${variationLanguageRankSql},
            ${variationConditionRankSql},
            CASE WHEN cv."isDefault" THEN 0 ELSE 1 END,
            ls."marketPrice" DESC NULLS LAST,
            cv.id ASC
        ) AS rn
      FROM "CardVariation" cv
      INNER JOIN target_cards tc ON tc.id = cv."cardId"
      LEFT JOIN latest_snapshots ls ON ls."cardVariationId" = cv.id
      WHERE cv."languageCode" IS NULL OR LOWER(cv."languageCode") = 'en'
    ),
    card_metrics AS (
      SELECT
        tc.id AS "cardId",
        rv."currentPrice",
        COALESCE(rv."variationCount", 0)::int AS "variationCount"
      FROM target_cards tc
      LEFT JOIN ranked_variations rv
        ON rv."cardId" = tc.id
       AND rv.rn = 1
    )
    UPDATE "Card" c
    SET
      "currentPrice" = cm."currentPrice",
      "variationCount" = cm."variationCount"
    FROM card_metrics cm
    WHERE c.id = cm."cardId"
  `);
}
