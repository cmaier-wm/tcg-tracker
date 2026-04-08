# Quickstart: Microsoft Teams Portfolio Alerts

## Prerequisites

- Local dependencies installed with `npm install`
- Local database running with `npm run db:up`
- Prisma client generated with `npm run db:generate`
- A Microsoft Teams workflow webhook URL that posts to a chat or channel you can
  inspect
- An application encryption secret available for local development

## Local Setup

1. Start the database and generate Prisma artifacts:

   ```bash
   npm run db:up
   npm run db:generate
   npm run db:migrate
   ```

2. Set the local encryption secret before starting the app:

   ```bash
   export TEAMS_WEBHOOK_ENCRYPTION_KEY='replace-with-a-local-secret'
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open the settings page at `http://127.0.0.1:3000/settings`.

## Manual Verification

### Story 1: Receive a Teams gain alert

1. In Teams, create or copy a workflow webhook URL for the target chat or
   channel.
2. In the app settings page, save the Teams destination label, paste the
   workflow URL, and enable alerts.
3. Make a portfolio change large enough to push the next valuation snapshot more
   than `$1,000` above the baseline set at enablement time.
4. Trigger snapshot processing through the existing app flow that saves
   valuation snapshots.
5. Confirm one Teams message appears in the configured destination and includes
   the updated portfolio value, gain amount, and evaluation time.

### Story 2: Disable alerts

1. Disable Teams alerts on the settings page.
2. Trigger another portfolio valuation increase greater than `$1,000`.
3. Run snapshot processing again.
4. Confirm no new Teams message appears and the settings page still shows alerts
   as disabled.

### Story 3: Prevent duplicates

1. Re-enable alerts and trigger one qualifying gain so a Teams message is sent.
2. Run snapshot processing again without increasing the portfolio another
   `$1,000` beyond the last delivered value.
3. Confirm no duplicate Teams message appears.
4. Increase the portfolio by more than another `$1,000` above the last notified
   value.
5. Run snapshot processing once more and confirm exactly one additional Teams
   message is delivered.

## Automated Verification Target

- `npm run test:unit`
- `npm run test:integration`
- `npm run test:e2e`

## Current Verification Status

- `npm run db:generate` succeeded locally on 2026-04-07.
- `npm run build` succeeded locally on 2026-04-07.
- `npm run test:unit` succeeded locally on 2026-04-07.
- `npm run test:integration` succeeded locally on 2026-04-07.
- `npm run test:e2e -- tests/e2e/teams-alerts.spec.ts` succeeded locally on 2026-04-07.
- `npx prisma migrate deploy` applied `0002_teams_alerts` to the local PostgreSQL database on 2026-04-07.

## Failure Checks

- If the Teams workflow URL is invalid or revoked, the settings or portfolio UI
  must expose a delivery failure state without inspecting logs.
- If the encryption key is missing, Teams alert configuration should fail fast
  with a clear server-side validation error.
