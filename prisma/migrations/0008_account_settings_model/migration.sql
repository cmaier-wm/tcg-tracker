CREATE TABLE "AccountSettings" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "themeMode" TEXT NOT NULL DEFAULT 'dark',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AccountSettings_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AccountSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "AccountSettings_userId_key" ON "AccountSettings"("userId");

INSERT INTO "AccountSettings" ("id", "userId", "themeMode", "createdAt", "updatedAt")
SELECT
  'account-settings-' || "userId",
  "userId",
  COALESCE("themeMode", 'dark'),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "TeamsAlertPreference"
ON CONFLICT ("userId") DO NOTHING;

ALTER TABLE "TeamsAlertPreference" DROP COLUMN "themeMode";
