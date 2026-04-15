# Quickstart: Portfolio Spreadsheet Export

## Prerequisites

- Local dependencies installed with `npm install`
- Local database running with `npm run db:up` for database-backed portfolio
  verification, or no `DATABASE_URL` configured when intentionally verifying
  the demo fallback path
- Prisma client generated with `npm run db:generate`
- Local auth secret configured with `AUTH_SECRET`
- A registered test account that can access `/portfolio`

## Local Setup

1. Start the database and ensure Prisma artifacts are current:

   ```bash
   npm run db:up
   npm run db:generate
   npm run db:migrate
   ```

2. Set the local auth secret before starting the app:

   ```bash
   export AUTH_SECRET='replace-with-a-local-secret'
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Register or sign in to an account and add holdings if needed so export has
   data to return.

## Manual Verification

### Story 1: Download my portfolio spreadsheet

1. Sign in to an account with at least two portfolio holdings.
2. Open `/portfolio`.
3. Trigger the portfolio export action.
4. Confirm the browser downloads a file whose name clearly identifies it as a
   portfolio export.
5. Confirm the page shows a success toast after the download starts.
6. Open the downloaded file in a spreadsheet application.
7. Confirm the file contains one row per holding and human-readable column
   headers.
8. Confirm at least the following columns are present and populated when data
   exists: category, set, card name, collector number, quantity, and estimated
   value.
9. Confirm holdings with no latest price data still appear with a clear blank or
   unavailable valuation field rather than being omitted.

### Story 2: Export only my account data

1. Register or sign in as `User A` and add one or more holdings.
2. Export the portfolio and keep the downloaded file for comparison.
3. Sign out, then register or sign in as `User B` with different holdings or no
   holdings.
4. Export again.
5. Confirm `User B`'s file contains only `User B`'s holdings and does not
   include any rows from `User A`.
6. Expire or clear the current session, then trigger export again.
7. Confirm the app requires re-authentication and does not download a file.

### Story 3: Receive useful empty-state feedback

1. Sign in as an account with no portfolio holdings.
2. Open `/portfolio`.
3. Attempt to export the portfolio.
4. Confirm the UI explains there is no portfolio data available to export.
5. Confirm no misleading success download is produced.
6. Call the export route directly while authenticated with an empty portfolio
   and confirm it returns the documented empty-state API outcome.

## Demo Fallback Verification

1. Stop the app and unset `DATABASE_URL` or run in a test or local configuration
   that uses the existing demo fallback path.
2. Start the app and sign in to a local demo-backed account flow.
3. Add demo holdings if needed.
4. Trigger export and confirm the downloaded file still contains recognizable
   row data built from the demo card catalog.

## Automated Verification Target

- `npm run test:unit`
- `npm run test:integration`
- `npm run test:e2e`
- `npm run build`

## Implementation Verification Notes

- `npm run test:integration` passed on April 10, 2026, including the new
  export route, export button, portfolio page, and export contract coverage.
- `npm run build` passed on April 10, 2026, with `/api/portfolio/export`
  included in the generated route manifest.
- `curl --max-time 20 -i http://127.0.0.1:3001/api/portfolio/export`
  returned `401 Unauthorized` with the documented JSON payload when verified
  against a Next.js server started from this worktree on April 10, 2026.
- `npm run test:e2e` is currently blocked in this Codex environment for two
  separate reasons:
  1. The stock Playwright `webServer` flow reused or launched the primary
     checkout at `/Users/cmaier/Source/tcg-tracker` instead of this worktree,
     so it exercised stale page content rather than the branch implementation.
  2. A custom Playwright run pointed at a worktree-local server on port `3001`
     then failed at browser launch with macOS sandbox Mach port permission
     errors before any test steps executed.
- Because of that environment blocker, rely on the passing integration coverage
  for the success toast, auth redirect, empty-state messaging, and route
  behavior until the Playwright worktree/server issue is resolved.

## Failure Checks

- Unauthenticated requests to the export route must not return file contents.
- Expired-session export attempts must not return file contents.
- Empty portfolios must return the documented non-download outcome.
- Export must include all holdings for the account, not just the visible page.
- Export must not leak holdings across user accounts.
- CSV escaping must preserve commas, quotes, and line breaks in card-identifying
  fields without corrupting the file shape.
- File downloads must set a recognizable filename and spreadsheet-compatible
  content type.
