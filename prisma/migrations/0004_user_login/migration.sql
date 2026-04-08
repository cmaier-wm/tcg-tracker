ALTER TABLE "UserAccount"
ADD COLUMN "isLegacyDefault" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "legacyClaimedAt" TIMESTAMP(3);

UPDATE "UserAccount"
SET "isLegacyDefault" = true
WHERE "id" = 'demo-user' OR LOWER("email") = 'collector@local.tcg';

CREATE TABLE "UserCredential" (
  "userId" TEXT NOT NULL,
  "normalizedEmail" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "UserCredential_pkey" PRIMARY KEY ("userId")
);

CREATE UNIQUE INDEX "UserCredential_normalizedEmail_key" ON "UserCredential"("normalizedEmail");

ALTER TABLE "UserCredential"
ADD CONSTRAINT "UserCredential_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "UserAccount"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "AuthSession" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "sessionToken" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AuthSession_sessionToken_key" ON "AuthSession"("sessionToken");
CREATE INDEX "AuthSession_userId_expiresAt_idx" ON "AuthSession"("userId", "expiresAt");

ALTER TABLE "AuthSession"
ADD CONSTRAINT "AuthSession_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "UserAccount"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "AuthAuditEvent" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "eventType" TEXT NOT NULL,
  "outcome" TEXT NOT NULL,
  "detail" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AuthAuditEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuthAuditEvent_userId_createdAt_idx" ON "AuthAuditEvent"("userId", "createdAt");
CREATE INDEX "AuthAuditEvent_eventType_createdAt_idx" ON "AuthAuditEvent"("eventType", "createdAt");

ALTER TABLE "AuthAuditEvent"
ADD CONSTRAINT "AuthAuditEvent_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "UserAccount"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
