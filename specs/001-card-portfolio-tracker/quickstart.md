# Quickstart: Pokemon Card Portfolio Tracker

## Prerequisites

- Node.js 22 LTS
- Docker Desktop or a compatible Docker runtime
- npm 10+

## Setup

1. Install dependencies.
2. Start the local PostgreSQL service with Docker Compose.
3. Create a `.env` file with database connection values.
4. Generate the Prisma client.
5. Run database migrations.
6. Seed the starter dataset if you want Prisma-backed card and portfolio data.
7. Start the development server.
8. Run a catalog sync if you want search to cover the synchronized upstream
   catalog instead of only the starter dataset.

## Expected Commands

```bash
npm install
npm run db:up
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
npm run catalog:sync
```

## Verification Flow

1. Open `http://localhost:3000` in a browser and verify the home page renders
   visible content rather than a blank page or browser error.
2. Browse or search for a card in a supported category.
3. Open a card detail page and verify:
   - The card image is visible when available.
   - Current price and last update information are shown when available.
4. Open the price history section and verify:
   - A chart appears when multiple price snapshots exist.
   - A clear empty state appears when history is unavailable.
5. Add a card to the portfolio and verify:
   - The holding appears in the portfolio list.
   - Total estimated value updates after refresh.
6. Open portfolio history and verify:
   - A historical total-value chart appears when multiple valuation snapshots
     exist.

## Automated Test Commands

```bash
npm run test:unit
npm run test:integration
npm run test:e2e
npm run snapshots:run
npm run db:down
```

## Notes

- Historical charts depend on stored snapshot data, so fresh environments may
  require seed or sync data before chart views become meaningful.
- The current implementation ships with demo card, price, and portfolio data so
  the browse, pricing, and portfolio flows are testable immediately.
- Full catalog search depends on importing upstream Pokemon card metadata into
  PostgreSQL. `npm run catalog:sync` is the normal sync path for the first
  release.
- `npm run snapshots:run` refreshes pricing and portfolio valuation for the
  Pokemon scope while keeping upstream request volume bounded.
- Missing external image or pricing data is expected for some tracked cards
  and must render as a supported empty state rather than an application error.
- The app is expected to run natively during development; Docker is used for
  local infrastructure services only.
