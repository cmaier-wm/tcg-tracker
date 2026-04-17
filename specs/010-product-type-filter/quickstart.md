# Quickstart: Product Type Filter

## Prerequisites

1. Install dependencies with `npm install`.
2. Start local infrastructure with `npm run db:up`.
3. Ensure local auth secrets are exported if needed by the app shell.
4. Start the web app with `npm run dev`.
5. For iOS validation, open the generated project or run tests from `ios/`.

## Automated Verification

1. Run `npm run test:unit -- tests/unit/search-query.test.ts`.
2. Run `npm run test:integration -- tests/integration/cards-browser-page.test.tsx tests/integration/cards-browse.test.tsx tests/integration/catalog-filters.test.tsx tests/contract/cards-search.contract.test.ts`.
3. Start the app with `DATABASE_URL='postgresql://postgres:postgres@localhost:5432/tcg_tracker?schema=public' AUTH_SECRET='local-secret' TEAMS_WEBHOOK_ENCRYPTION_KEY='local-secret' npm run dev`.
4. In a second terminal, run `DATABASE_URL='postgresql://postgres:postgres@localhost:5432/tcg_tracker?schema=public' AUTH_SECRET='local-secret' TEAMS_WEBHOOK_ENCRYPTION_KEY='local-secret' npm run test:e2e -- tests/e2e/home-product-type-filter.spec.ts`.
5. Run `cd ios && swift test --filter BrowseStoreTests`.

## Web Manual Smoke Check

1. Open `http://localhost:3000/`.
2. Confirm the home page shows Cards as the active product-type selection on
   first load.
3. Apply a search term or sort value, switch to Sealed Product, and confirm the
   search/sort controls remain unchanged while the visible results update.
4. Switch back to Cards and confirm the result set updates again.
5. Open the browser console during those flows and confirm no errors are logged.
6. Confirm sealed-product rows do not link into `/cards/[category]/[id]`.
7. Search for `code card` and confirm the browse UI shows no results instead of rendering code-card rows.

## iOS Manual Smoke Check

1. Launch the iOS app in Simulator.
2. Open the Browse tab and confirm Cards is the default product type.
3. Change sort or enter a query, then switch to Sealed Product and confirm the
   browse request refreshes without clearing the existing query/sort state.
4. If a selected product type has no matches, confirm the empty state names the
   selected mode clearly.
5. Confirm card rows still open card detail and sealed-product rows remain
   browse-only in this increment.
6. Search for `code card` and confirm the Browse tab does not render code-card rows.

## Expected Outcomes

1. Home web browse defaults to `Type = Cards` and omits `productType` from the
   URL until the user chooses `Sealed Product`.
2. Switching to `Sealed Product` preserves any active `q`, `set`, and `sort`
   values.
3. Sealed-product rows render without card-detail links on web and show
   browse-only treatment on iOS.
4. Switching back to `Cards` keeps the active sort and removes the
   `productType=sealed-product` query parameter.
5. Code-card catalog entries remain hidden from the browse UI across product-type selections.
