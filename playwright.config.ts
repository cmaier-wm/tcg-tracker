import { defineConfig } from "@playwright/test";

process.env.DATABASE_URL ??=
  "postgresql://postgres:postgres@127.0.0.1:5432/tcg_tracker?schema=public";
process.env.AUTH_SECRET ??= "playwright-local-auth-secret";
process.env.TEAMS_WEBHOOK_ENCRYPTION_KEY ??= "playwright-local-secret";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL,
    trace: "on-first-retry"
  },
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? undefined
    : {
        command: `env DATABASE_URL=${process.env.DATABASE_URL} AUTH_SECRET=${process.env.AUTH_SECRET} TEAMS_WEBHOOK_ENCRYPTION_KEY=${process.env.TEAMS_WEBHOOK_ENCRYPTION_KEY} npm run dev`,
        url: baseURL,
        reuseExistingServer: true
      }
});
