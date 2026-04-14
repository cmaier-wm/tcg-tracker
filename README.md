# tcg-tracker

This repository contains a Pokemon card and portfolio tracking web application
built with Next.js. The working rules for the project live in
`.specify/memory/constitution.md`.

## Workflow

All non-trivial work follows this path:

1. Create or update `spec.md`.
2. Produce `plan.md` and any supporting design artifacts.
3. Generate `tasks.md` with exact file paths and verification steps.
4. Implement only after the planning artifacts are implementation-ready.

## Stack

The current application uses:

- TypeScript 5.9 on Node.js 22 LTS
- Next.js 16 with React 19
- PostgreSQL 17 with Prisma ORM
- Docker Compose for local PostgreSQL
- TanStack Query, Recharts, and Zod
- Vitest, React Testing Library, and Playwright

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
npm run dev
```

`npm run dev` automatically applies checked-in Prisma migrations with
`prisma migrate deploy` and refreshes the generated Prisma client before the
server starts on port `3000`. Keep `npm run db:migrate` for the separate case
where you are authoring a brand-new local migration.

## User Login

The app now supports local email-and-password registration and sign-in for
account-scoped portfolio data and Teams alert settings.

Local setup notes:

- Set `AUTH_SECRET` before starting the app so signed-in sessions can be
  issued consistently across reloads.
- `npm run dev` now applies checked-in auth migrations automatically so the
  `UserCredential`, `AuthSession`, and `AuthAuditEvent` tables stay in sync
  without a separate manual migrate step.
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
- After changing Prisma versions or generator settings, rerun
  `npm run db:generate` before `npm run build` and `npm run azure:package`.
- If Azure serves demo fallback data while the database is populated, verify the
  deployment artifact contains
  `libquery_engine-debian-openssl-3.0.x.so.node` under
  `.next/standalone/node_modules/.prisma/client/`.

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
  app server is running. That imports the upstream Pokemon catalog into
  PostgreSQL so `/cards` search covers the synchronized catalog instead of only
  demo data.
- The first release is Pokemon-only. Full multi-category sync is intentionally
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
