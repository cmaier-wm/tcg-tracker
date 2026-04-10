import { defineConfig } from "@playwright/test";

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
        command: "env DATABASE_URL= TEAMS_WEBHOOK_ENCRYPTION_KEY=playwright-local-secret npm run dev",
        url: baseURL,
        reuseExistingServer: true
      }
});
