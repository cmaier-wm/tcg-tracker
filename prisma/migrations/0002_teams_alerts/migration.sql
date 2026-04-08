-- CreateTable
CREATE TABLE "TeamsAlertPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "destinationLabel" TEXT,
    "encryptedWebhookUrl" TEXT,
    "webhookUrlIv" TEXT,
    "baselineValue" DOUBLE PRECISION,
    "lastEvaluatedAt" TIMESTAMP(3),
    "lastDeliveredAt" TIMESTAMP(3),
    "lastFailureAt" TIMESTAMP(3),
    "lastFailureMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamsAlertPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamsAlertDelivery" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "preferenceId" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL,
    "portfolioValue" DOUBLE PRECISION NOT NULL,
    "baselineValue" DOUBLE PRECISION NOT NULL,
    "gainAmount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "failureMessage" TEXT,
    "responseCode" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamsAlertDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeamsAlertPreference_userId_key" ON "TeamsAlertPreference"("userId");

-- CreateIndex
CREATE INDEX "TeamsAlertDelivery_userId_createdAt_idx" ON "TeamsAlertDelivery"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "TeamsAlertDelivery_preferenceId_createdAt_idx" ON "TeamsAlertDelivery"("preferenceId", "createdAt");

-- AddForeignKey
ALTER TABLE "TeamsAlertPreference" ADD CONSTRAINT "TeamsAlertPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamsAlertDelivery" ADD CONSTRAINT "TeamsAlertDelivery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamsAlertDelivery" ADD CONSTRAINT "TeamsAlertDelivery_preferenceId_fkey" FOREIGN KEY ("preferenceId") REFERENCES "TeamsAlertPreference"("id") ON DELETE CASCADE ON UPDATE CASCADE;
