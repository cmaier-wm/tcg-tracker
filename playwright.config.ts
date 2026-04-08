import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry"
  },
  webServer: {
    command: "env DATABASE_URL= TEAMS_WEBHOOK_ENCRYPTION_KEY=playwright-local-secret npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true
  }
});
