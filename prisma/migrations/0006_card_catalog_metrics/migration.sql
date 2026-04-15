ALTER TABLE "Card"
ADD COLUMN "currentPrice" DOUBLE PRECISION,
ADD COLUMN "variationCount" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS "Card_currentPrice_idx" ON "Card"("currentPrice");

WITH latest_snapshots AS (
  SELECT DISTINCT ON (ps."cardVariationId")
    ps."cardVariationId",
    ps."marketPrice"
  FROM "PriceSnapshot" ps
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
        CASE
          WHEN LOWER(COALESCE(cv."languageCode", '')) = 'en' AND ls."marketPrice" IS NOT NULL THEN 0
          WHEN COALESCE(cv."languageCode", '') = '' AND ls."marketPrice" IS NOT NULL THEN 1
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
    ) AS rn
  FROM "CardVariation" cv
  LEFT JOIN latest_snapshots ls ON ls."cardVariationId" = cv.id
  WHERE cv."languageCode" IS NULL OR LOWER(cv."languageCode") = 'en'
),
card_metrics AS (
  SELECT
    c.id AS "cardId",
    rv."currentPrice",
    COALESCE(rv."variationCount", 0)::int AS "variationCount"
  FROM "Card" c
  LEFT JOIN ranked_variations rv
    ON rv."cardId" = c.id
   AND rv.rn = 1
)
UPDATE "Card" c
SET
  "currentPrice" = cm."currentPrice",
  "variationCount" = cm."variationCount"
FROM card_metrics cm
WHERE c.id = cm."cardId";
