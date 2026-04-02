# Quickstart: TCG Card Portfolio Tracker

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
6. Start the development server.

## Expected Commands

```bash
npm install
npm run db:up
npm run db:generate
npm run db:migrate
npm run dev
```

## Verification Flow

1. Open the app in a browser.
2. Browse or search for a card in a supported category.
3. Open a card detail page and verify:
   - The card image is visible when available.
   - Variation options are visible, including language choices when available.
   - Current price and last update information are shown when available.
4. Open the price history section and verify:
   - A chart appears when multiple price snapshots exist.
   - A clear empty state appears when history is unavailable.
5. Add a card variation to the portfolio and verify:
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
- Missing external image or pricing data is expected for some card variations
  and must render as a supported empty state rather than an application error.
- The app is expected to run natively during development; Docker is used for
  local infrastructure services only.
