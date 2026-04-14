# Quickstart: iOS Mobile App

## Prerequisites

- Local dependencies installed with `npm install`
- Local database running with `npm run db:up`
- Prisma client generated with `npm run db:generate`
- Local auth and Teams secrets configured for the existing backend
- Xcode with an iOS simulator available for manual verification

## Local Backend Setup

1. Start the local database and refresh Prisma artifacts:

   ```bash
   npm run db:up
   npm run db:generate
   npm run db:migrate
   ```

2. Export the local secrets required by the backend:

   ```bash
   export AUTH_SECRET='replace-with-a-local-secret'
   export TEAMS_WEBHOOK_ENCRYPTION_KEY='replace-with-a-local-secret'
   ```

3. Start the existing backend:

   ```bash
   npm run dev
   ```

4. Confirm the backend is reachable before opening the iOS client:

   ```bash
   curl --max-time 20 -i http://127.0.0.1:3000/api/cards?offset=0&limit=1
   ```

## Local iOS Setup

1. Open `ios/TCGTracker/TCGTracker.xcworkspace` in Xcode, or open the Swift
   package at `ios/Package.swift` directly if you prefer the package view.
2. Point the debug configuration at `http://127.0.0.1:3000` for the local
   backend when running in Simulator.
3. Launch an iPhone simulator.
4. Build and run the iOS app.

## Manual Verification

### Story 1: Sign in and review collection summary

1. Launch the mobile app while signed out.
2. Sign in with valid credentials.
3. Confirm the app enters the signed-in mobile experience.
4. Confirm the signed-in landing experience shows either summary metrics or a
   clear empty state for a user without holdings.
5. Close and relaunch the app, then confirm the signed-in state persists.
6. Sign out and confirm the app returns to sign-in.
7. Attempt sign-in with invalid credentials and confirm a clear failure message
   appears without entering protected areas.

### Story 2: Browse cards and inspect pricing

1. Open mobile browse after sign-in.
2. Search for a known card such as `charizard`.
3. Confirm the results show identifying details, price, and imagery in a
   mobile-friendly layout.
4. Open card detail and confirm image, variation information, and price history
   render correctly.
5. Confirm cards with missing image or missing history show an intentional
   empty-state presentation instead of broken layout.

### Story 3: Manage portfolio holdings

1. From card detail, add a variation to the portfolio.
2. Confirm the holding appears in portfolio and affects totals.
3. Edit the quantity and confirm totals update after refresh.
4. Remove the holding and confirm it disappears from the portfolio list.
5. Expire or clear the session, then attempt a holding write and confirm the
   app requires sign-in again before protected changes continue.

### Story 4: Update supported settings

1. Open settings from the signed-in mobile shell.
2. Review supported settings and alert preferences.
3. Update a supported alert value and save it.
4. Reload settings and confirm the saved value is returned.
5. Sign out and confirm settings is no longer reachable as a protected screen.

## Automated Verification Target

- `npm run test:integration`
- `npm run test:unit`
- Focused Vitest contract coverage for any new mobile backend routes
- Native-client unit coverage for request/response mapping and signed-in state
  handling through `cd ios && swift test`

## Current Verification Notes

- The backend/mobile composition work is covered by `npm run test:unit`,
  `npm run test:integration`, and `npm run build`.
- `swift test` currently requires a local Xcode + toolchain pair that matches
  the host SDK. In this workspace the installed Command Line Tools and Swift
  compiler are mismatched, so native tests should be rerun once the local
  Apple toolchain is aligned.

## Failure Checks

- Signed-out users must never see protected summary, portfolio, or settings
  content.
- Invalid credentials must not create an authenticated session.
- The signed-in landing summary must match server-owned portfolio totals after
  refresh.
- Cards with missing image or pricing history must still render a usable empty
  state.
- Holding quantity validation must reject zero, negative, or malformed values.
- Invalid account-backed settings updates must fail without persisting changes.
