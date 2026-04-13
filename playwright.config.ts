import { defineConfig } from "@playwright/test";

process.env.DATABASE_URL ??=
  "postgresql://postgres:postgres@127.0.0.1:5432/tcg_tracker?schema=public";
process.env.AUTH_SECRET ??= "playwright-local-auth-secret";
process.env.TEAMS_WEBHOOK_ENCRYPTION_KEY ??= "playwright-local-secret";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry"
  },
  webServer: {
    command:
      "env DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/tcg_tracker?schema=public AUTH_SECRET=playwright-local-auth-secret TEAMS_WEBHOOK_ENCRYPTION_KEY=playwright-local-secret npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true
  }
});
