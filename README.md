# tcg-tracker

This repository contains a Pokémon card and portfolio tracking web application
built with Next.js. The working rules for the project live in
`.specify/memory/constitution.md`.

## Workflow

All non-trivial work follows this path:

1. Create or update `spec.md`.
2. Produce `plan.md` and any supporting design artifacts.
3. Generate `tasks.md` with exact file paths and verification steps.
4. Implement only after the planning artifacts are implementation-ready.

By constitution, product features and behavior changes are required to ship on
both the web application and the native iOS client in the same increment unless
that rule is amended or a time-bound exception is explicitly approved in the
plan.

## Stack

The current application uses:

- TypeScript 5.9 on Node.js 22 LTS
- Next.js 16 with React 19
- PostgreSQL 17 with Prisma ORM
- Docker Compose for local PostgreSQL
- TanStack Query, Recharts, and Zod
- Vitest, React Testing Library, and Playwright
- Swift 6 with SwiftUI, Observation, and Swift Charts for the native iOS client

The primary feature specification and delivery artifacts live under
[`specs/001-card-portfolio-tracker/`](/Users/cmaier/Source/tcg-tracker/specs/001-card-portfolio-tracker).

## Development Tooling

MCP usage for this repository is documented in
[`docs/development/mcps.md`](/Users/cmaier/Source/tcg-tracker/docs/development/mcps.md).
The current documented MCPs are Azure MCP, Figma MCP, a local Postgres MCP,
and Playwright MCP for development workflows only; none is a runtime dependency
of the application.

Current UI design reference:

- Figma Make: https://www.figma.com/make/6ao1OMigGMRBj68UqBEOWA/TCG-Card-Tracker-App?p=f&t=XknWAY1aATbX7RHT-0

## Running Locally

```bash
npm install
npm run db:up
npm run db:seed
export AUTH_SECRET='replace-with-a-local-secret'
export TEAMS_WEBHOOK_ENCRYPTION_KEY='replace-with-a-local-secret'
export AUTH_RESET_EMAIL_ENDPOINT='https://your-reset-delivery-endpoint'
npm run dev
```

`npm run dev` automatically applies checked-in Prisma migrations with
`prisma migrate deploy` and refreshes the generated Prisma client before the
server starts on port `3000`. Keep `npm run db:migrate` for the separate case
where you are authoring a brand-new local migration.

## Native iOS Client

The repository now includes an iPhone-first native client under
[`ios/`](/Users/cmaier/Source/tcg-tracker/ios).

Local mobile workflow:

1. Start the backend with the normal local web commands shown above.
2. Use the debug base URL `http://127.0.0.1:3000` in Simulator.
3. Generate the local Xcode project, then open the workspace under
   [`ios/TCGTracker/`](/Users/cmaier/Source/tcg-tracker/ios/TCGTracker).
4. Run the native unit suite from the package root with:

```bash
cd ios
swift test
```

5. Regenerate the runnable Xcode project whenever the iOS source structure
   changes:

```bash
ruby ios/scripts/generate_xcodeproj.rb
```

The native client reuses the existing Next.js app as its only backend. Mobile-
specific backend additions are limited to `/api/mobile/session` and
`/api/mobile/home` for signed-in bootstrap and portfolio summary composition.

If Codex Desktop worktrees are missing the `Run` action, run
`npm run codex:sync-worktrees` from this checkout to copy the tracked
environment file into each `tcg-tracker` worktree under `$CODEX_HOME/worktrees`
or `~/.codex/worktrees`.

## User Login

The app now supports local email-and-password registration and sign-in for
account-scoped portfolio data and Teams alert settings.

Local setup notes:

- Set `AUTH_SECRET` before starting the app so signed-in sessions can be
  issued consistently across reloads.
- `npm run dev` now applies checked-in auth migrations automatically so the
  `UserCredential`, `AuthSession`, and `AuthAuditEvent` tables stay in sync
  without a separate manual migrate step.
- Password reset emails can be sent directly by the app when `RESEND_API_KEY`
  and `AUTH_RESET_FROM_EMAIL` are set. `AUTH_RESET_FROM_NAME` is optional.
- `AUTH_RESET_EMAIL_ENDPOINT` remains optional for local development when you
  want to forward reset requests to another server-side delivery endpoint that
  accepts `{ "email": "...", "resetUrl": "..." }`.
- When neither Resend nor `AUTH_RESET_EMAIL_ENDPOINT` is configured locally,
  password reset requests log the recovery URL to the server output.
- For a concrete local Resend test path, start the app with
  `RESEND_API_KEY`, `AUTH_RESET_FROM_EMAIL`, and optionally
  `AUTH_RESET_FROM_NAME`. If you still prefer an internal callback path, set
  `AUTH_RESET_EMAIL_ENDPOINT='http://127.0.0.1:3000/api/dev/password-reset-email'`.
- `/cards` and card detail pages remain public while `/portfolio`, `/settings`,
  and the matching portfolio/settings APIs require authentication.
- The first newly registered account claims any legacy demo portfolio/settings
  data once; later accounts start from empty account-owned state.

## Microsoft Teams Alerts

The settings page now supports Microsoft Teams portfolio gain alerts through a
user-provided Teams Workflow webhook URL.

Local setup notes:

- Set `TEAMS_WEBHOOK_ENCRYPTION_KEY` before starting the app so saved webhook
  URLs can be encrypted at rest.
- `npm run dev` applies checked-in Prisma migrations automatically before the
  app starts, including the Teams alert tables when they are part of the repo
  migration history.
- Alerts are evaluated whenever valuation snapshots are saved. A new Teams
  message is sent only when the portfolio rises more than `$1,000` above the
  last successful alert baseline.

## Deploying To Azure

The repository now includes an `azd` + Bicep deployment path for a production
environment in Azure App Service with Azure Database for PostgreSQL Flexible
Server and Azure Key Vault.

Core commands:

```bash
env AZD_CONFIG_DIR=/tmp/.azd azd env new prod
env AZD_CONFIG_DIR=/tmp/.azd azd env set AZURE_LOCATION centralus
env AZD_CONFIG_DIR=/tmp/.azd azd env set AZURE_SUBSCRIPTION_ID a94e41d4-5686-46fc-8390-e18bbbbb27cc
env AZD_CONFIG_DIR=/tmp/.azd azd env set POSTGRES_ADMIN_USERNAME tcgtrackeradmin
env AZD_CONFIG_DIR=/tmp/.azd azd env set POSTGRES_ADMIN_PASSWORD <url-safe-password>
env AZD_CONFIG_DIR=/tmp/.azd azd provision --preview
env AZD_CONFIG_DIR=/tmp/.azd azd up
```

Post-deploy verification:

```bash
npm run build
env AZD_CONFIG_DIR=/tmp/.azd azd env get-value SERVICE_WEB_URI
npm run azure:verify -- "$(env AZD_CONFIG_DIR=/tmp/.azd azd env get-value SERVICE_WEB_URI)"
```

Azure packaging note:

- Azure App Service runs this app on Linux. Keep
  `prisma/schema.prisma` configured with
  `binaryTargets = ["native", "debian-openssl-3.0.x"]` so the packaged
  standalone build includes Prisma's Linux query engine.
- Azure deployments start through `node azure-start.mjs`, which runs
  `prisma migrate deploy` against the packaged `prisma/` directory before
  booting Next.js. Keep the checked-in migrations current before `azd up`.
- After changing Prisma versions or generator settings, rerun
  `npm run db:generate` before `npm run build` and `npm run azure:package`.
- If Azure serves demo fallback data while the database is populated, verify the
  deployment artifact contains
  `libquery_engine-debian-openssl-3.0.x.so.node` under
  `.next/standalone/node_modules/.prisma/client/`.
- For deployed password reset emails, configure `RESEND_API_KEY`,
  `AUTH_RESET_FROM_EMAIL`, and optionally `AUTH_RESET_FROM_NAME` in the Azure
  app settings or Key Vault-backed references used by App Service.

## Verification

Manual smoke check:

- Open `http://localhost:3000` after `npm run dev` and confirm the home page
  renders visible content instead of a blank page or browser error.

Automated checks:

```bash
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:e2e -- tests/e2e/auth.spec.ts
npm run test:e2e -- tests/e2e/teams-alerts.spec.ts
npm run catalog:sync -- 3
npm run snapshots:run
npm run db:down
```

## Notes

- The current implementation includes demo catalog and portfolio data so the UI
  remains usable before a live upstream sync is configured.
- If PostgreSQL is configured and migrated, `npm run db:seed` loads the same
  starter card dataset into Prisma-backed storage.
- To search beyond the starter dataset, run `npm run catalog:sync` while the
  app server is running. That imports the upstream Pokémon catalog into
  PostgreSQL so `/cards` search covers the synchronized catalog instead of only
  demo data.
- The first release is Pokémon-only. Full multi-category sync is intentionally
  not part of the normal workflow.
- Static product data is refreshed only when a set is older than 7 days.
- Pricing and SKU data are refreshed at most once per 24 hours per set and are
  merged back to products by product ID.
- Upstream requests are intentionally throttled with a small delay between
  calls. Tune this with `TCGTRACKING_REQUEST_DELAY_MS` if you want to be even
  gentler.
- Snapshot history can be refreshed through the scheduled snapshot route or
  `npm run snapshots:run` while the app server is running.
- Production Azure hosting targets Azure App Service on Linux in `centralus`
  with Azure Database for PostgreSQL Flexible Server 17 and Key Vault-backed
  secrets.
