# Quickstart: Password Reset

## Goal

Validate that signed-out users can request a password reset, complete it with a
valid reset path, and recover their account without affecting account-owned
portfolio or settings data.

## Prerequisites

1. Start local infrastructure with `npm run db:up`.
2. Ensure local auth env vars are set:
   - `AUTH_SECRET`
   - `TEAMS_WEBHOOK_ENCRYPTION_KEY`
3. Start the app with `npm run dev`.
4. If you want to test delivered emails instead of local log output, set either
   `RESEND_API_KEY` plus `AUTH_RESET_FROM_EMAIL` (and optionally
   `AUTH_RESET_FROM_NAME`) or set `AUTH_RESET_EMAIL_ENDPOINT` to a server-side
   reset delivery endpoint.
5. Use a local account that already has portfolio or settings data.

## Manual Verification

### Story 1: Request a reset link

1. Open `/login`.
2. Follow the password reset entry point to `/reset-password`.
3. Submit the email address of an existing email/password account.
4. Confirm the UI shows a generic success message.
5. Submit a clearly unregistered email address.
6. Confirm the UI shows the same generic success message as step 4.
7. If email delivery is configured, open the delivered reset email. Otherwise,
   inspect the server log for the emitted reset URL and copy the newest reset
   path for the registered account.

Expected result:
- Existing and non-existing accounts receive indistinguishable request
  confirmations.
- Local development exposes the reset path through the configured delivery
  channel or the developer log, not through a special UI response.

### Story 2: Complete a reset successfully

1. Open the valid reset path captured from the local log.
2. Submit a compliant new password that differs from the current password.
3. Confirm the app shows a successful reset confirmation.
4. Sign in with the new password.
5. Confirm the account reaches the normal signed-in experience and still owns
   the same portfolio/settings data as before.
6. Sign out and attempt to sign in with the old password.

Expected result:
- The new password works immediately.
- The old password is rejected.
- Portfolio holdings and account-backed settings are unchanged after recovery.

### Story 3: Reject invalid or stale reset paths

1. Request a reset for the same account twice.
2. Capture both reset paths from local logs.
3. Attempt to complete the reset with the older path.
4. Confirm the app rejects it and directs the user to request a new reset.
5. Complete the reset with the newer path.
6. Attempt to reuse that same newer path again.

Expected result:
- Older reset paths become invalid once a newer path is issued.
- Used reset paths cannot be reused.
- Invalid or reused reset flows provide actionable guidance to request a fresh
  reset.

### Session Revocation Check

1. Sign in to the same account in one browser.
2. Request and complete a password reset from a second browser or private window.
3. Return to the original signed-in browser and attempt a protected action.

Expected result:
- The original browser session is no longer accepted and must sign in again.

## Suggested Automated Coverage

- Contract tests for generic request responses and invalid-token completion
  responses
- Integration tests for token issuance, revocation, expiry, and session
  deletion
- Form tests for request/completion validation messaging
- End-to-end tests for successful recovery and expired/reused token paths
