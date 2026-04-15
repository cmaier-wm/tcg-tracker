# Quickstart: User Login And Account-Scoped Data

## Prerequisites

- Local dependencies installed with `npm install`
- Local database running with `npm run db:up`
- Prisma client generated with `npm run db:generate`
- Local auth secrets configured for session signing
- Local `DATABASE_URL` configured for the same PostgreSQL instance used by
  portfolio and settings data

## Local Setup

1. Start the database and refresh Prisma artifacts:

   ```bash
   npm run db:up
   npm run db:generate
   npm run db:migrate
   ```

2. Set the local authentication secret before starting the app:

   ```bash
   export AUTH_SECRET='replace-with-a-local-secret'
   ```

3. Confirm `DATABASE_URL` points at the local PostgreSQL instance and that
   migrations are applied before opening auth flows.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the app and navigate to the authentication entry point.

## Deployed Environment Setup

- Configure `AUTH_SECRET` in Azure App Service to a stable production secret
  value used for session signing.
- Configure `DATABASE_URL` in Azure App Service so auth, portfolio, and
  settings all resolve the same account-owned PostgreSQL state.
- Ensure the deployed app is served over HTTPS so Auth.js secure cookies work
  correctly in production.
- Run Prisma migrations during deployment before sign-in traffic reaches the app
  so user, session, and account-owned data tables exist.
- Do not require SMTP, password reset, or email verification infrastructure for
  v1; those are only needed if later scope adds recovery or verification flows.

## Production Smoke Check

1. Deploy the app with `AUTH_SECRET` and the production database connection
   configured.
2. Open the deployed login/register flow over HTTPS.
3. Register a new account and confirm the session persists after a page reload.
4. Confirm successful register and login submissions complete within 2 seconds
   once the page is loaded.
5. Sign out and confirm the app redirects to `/login` in a signed-out state.
6. Sign back in and confirm the same account-owned portfolio/settings data are
   returned.
7. Open `/cards` and a card detail page while signed out and confirm browsing
   remains public.
8. Trigger an add-to-portfolio action from a public card page, complete auth,
   and confirm the app returns to that public page before continuing.
9. Attempt to open `/portfolio` or `/settings` while signed out and confirm the
   app redirects or rejects access consistently.
10. Verify production configuration includes `AUTH_SECRET`, `DATABASE_URL`,
   HTTPS, and completed migrations before sign-in traffic is considered ready.

## Manual Verification

### Story 1: Register and sign in

1. Open the registration page as a signed-out visitor.
2. Create a new account with a valid email and password.
3. Confirm the app transitions into an authenticated state.
4. Reload the app and confirm the session remains active.
5. Sign out and verify the app redirects to `/login` and returns to the
   signed-out navigation state.
6. Sign back in with the same account and confirm the session is restored.
7. Attempt registration with malformed email, missing credentials, and a
   password shorter than 8 characters; confirm validation errors without
   account creation.
8. Attempt sign-in with malformed or partial credentials and with an incorrect
   password; confirm validation or auth errors without creating a session.
9. Start auth from a public card page, complete sign-in, and confirm the app
   returns to that page when `returnTo` is valid.

### Story 2: Portfolio is account-scoped

1. Register `User A` and add one or more portfolio holdings.
2. Sign out and register or sign in as `User B`.
3. Confirm `User B` does not see `User A`’s portfolio holdings.
4. Add a different holding under `User B`.
5. Sign back into `User A` and confirm only `User A`’s holdings appear.
6. Create a newly registered account with no holdings and confirm portfolio
   shows an empty account-scoped state instead of legacy/shared data.
7. While signed out, open `/cards` and a card detail page and confirm browsing
   still works without redirecting to login.
8. Use add-to-portfolio from a public card page while signed out, complete
   auth, and confirm the app returns to the original public page.
9. Expire or clear the current session, then attempt a portfolio write and
   confirm the app rejects the write and prompts for sign-in again.
10. Sign in to the same account from a second browser/device, confirm both
   sessions can read the same account data, then sign out in one browser and
   confirm the other session remains active.

### Story 3: Settings are account-scoped

1. Sign in as `User A` and update account-backed settings such as Teams alerts.
2. Sign out and sign in as `User B`.
3. Confirm `User B` does not inherit `User A`’s saved account-backed settings.
4. Update settings under `User B`.
5. Sign back into `User A` and confirm `User A` still sees only their own settings.
6. Register a user with no saved Teams settings and confirm settings show the
   default empty account-backed state, including the saved theme preference.
7. Expire or clear the current session, then attempt to save settings and
   confirm the app rejects the write and prompts for sign-in again.

## Automated Verification Target

- `npm run test:unit`
- `npm run test:integration`
- `npm run test:e2e`
- `npm run build`

## Failure Checks

- Invalid credentials must not create a session and must produce a clear user-facing error.
- Malformed or partial credentials must fail validation without mutating account
  or session state.
- Duplicate registration attempts for an existing email must fail without mutating the existing account.
- Unauthenticated requests to protected portfolio/settings routes must be rejected or redirected consistently.
- Public card browsing routes must remain reachable while signed out.
- Public browsing auth redirects must only honor validated same-app `returnTo`
  destinations and otherwise land on `/portfolio`.
- Expired-session portfolio/settings writes must be rejected consistently.
- Concurrent sessions for the same account may coexist; signing out from one
  session must not revoke the others in v1.
- Legacy-data claim failures must not leave partially reassigned portfolio or
  settings records.
- Passwords must never be stored or logged in plain text during implementation or verification.
- Auth audit logs must omit plaintext passwords, password hashes, and raw
  session tokens.
