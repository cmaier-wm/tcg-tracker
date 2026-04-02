-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "CardCategory" (
    "id" TEXT NOT NULL,
    "sourceCategoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CardCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardSet" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "sourceSetId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT,
    "releasedOn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CardSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL,
    "setId" TEXT NOT NULL,
    "sourceProductId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cleanName" TEXT NOT NULL,
    "collectorNumber" TEXT,
    "rarity" TEXT,
    "imageUrl" TEXT,
    "externalProductUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardVariation" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "sourceSkuId" TEXT,
    "languageCode" TEXT,
    "finish" TEXT,
    "conditionCode" TEXT,
    "variantLabel" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CardVariation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceSnapshot" (
    "id" TEXT NOT NULL,
    "cardVariationId" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL,
    "marketPrice" DOUBLE PRECISION,
    "lowPrice" DOUBLE PRECISION,
    "highPrice" DOUBLE PRECISION,
    "listingCount" INTEGER,
    "sourceName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAccount" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioHolding" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cardVariationId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "notes" TEXT,
    "acquiredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortfolioHolding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioValuationSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL,
    "totalValue" DOUBLE PRECISION NOT NULL,
    "holdingCount" INTEGER NOT NULL,
    "pricedHoldingCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PortfolioValuationSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CardCategory_sourceCategoryId_key" ON "CardCategory"("sourceCategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "CardCategory_slug_key" ON "CardCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CardSet_sourceSetId_key" ON "CardSet"("sourceSetId");

-- CreateIndex
CREATE UNIQUE INDEX "Card_sourceProductId_key" ON "Card"("sourceProductId");

-- CreateIndex
CREATE UNIQUE INDEX "CardVariation_sourceSkuId_key" ON "CardVariation"("sourceSkuId");

-- CreateIndex
CREATE UNIQUE INDEX "CardVariation_cardId_languageCode_finish_conditionCode_vari_key" ON "CardVariation"("cardId", "languageCode", "finish", "conditionCode", "variantLabel");

-- CreateIndex
CREATE UNIQUE INDEX "PriceSnapshot_cardVariationId_sourceName_capturedAt_key" ON "PriceSnapshot"("cardVariationId", "sourceName", "capturedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserAccount_email_key" ON "UserAccount"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioHolding_userId_cardVariationId_key" ON "PortfolioHolding"("userId", "cardVariationId");

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioValuationSnapshot_userId_capturedAt_key" ON "PortfolioValuationSnapshot"("userId", "capturedAt");

-- AddForeignKey
ALTER TABLE "CardSet" ADD CONSTRAINT "CardSet_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CardCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_setId_fkey" FOREIGN KEY ("setId") REFERENCES "CardSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardVariation" ADD CONSTRAINT "CardVariation_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceSnapshot" ADD CONSTRAINT "PriceSnapshot_cardVariationId_fkey" FOREIGN KEY ("cardVariationId") REFERENCES "CardVariation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioHolding" ADD CONSTRAINT "PortfolioHolding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioHolding" ADD CONSTRAINT "PortfolioHolding_cardVariationId_fkey" FOREIGN KEY ("cardVariationId") REFERENCES "CardVariation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioValuationSnapshot" ADD CONSTRAINT "PortfolioValuationSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

