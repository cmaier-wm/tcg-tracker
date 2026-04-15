CREATE INDEX IF NOT EXISTS "CardSet_categoryId_idx" ON "CardSet"("categoryId");

CREATE INDEX IF NOT EXISTS "Card_setId_idx" ON "Card"("setId");

CREATE INDEX IF NOT EXISTS "CardVariation_cardId_idx" ON "CardVariation"("cardId");

CREATE INDEX IF NOT EXISTS "PriceSnapshot_cardVariationId_capturedAt_idx"
ON "PriceSnapshot"("cardVariationId", "capturedAt" DESC);
