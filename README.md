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
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

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

## Verification

Manual smoke check:

- Open `http://localhost:3000` after `npm run dev` and confirm the home page
  renders visible content instead of a blank page or browser error.

Automated checks:

```bash
npm run test:unit
npm run test:integration
npm run test:e2e
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
