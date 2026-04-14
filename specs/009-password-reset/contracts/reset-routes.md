# Password Reset Route Contract

## Signed-Out Routes

- `/login`
- `/reset-password`
- `/reset-password/[token]`

## API Routes

- `POST /api/auth/password-reset/request`
- `POST /api/auth/password-reset/confirm`

## Expected Behavior

- Signed-out users can navigate from `/login` to `/reset-password` without
  needing an existing session.
- Signed-in users who reach `/reset-password` or `/reset-password/[token]` are
  redirected to their signed-in destination instead of continuing account
  recovery.
- `POST /api/auth/password-reset/request` always returns the same acceptance
  response for registered and unregistered email addresses.
- `POST /api/auth/password-reset/confirm` accepts only the latest valid token
  for the account and rejects expired, revoked, malformed, or already used
  tokens.
- A successful reset updates the password, consumes the token, revokes older
  reset tokens, and deletes all active authenticated sessions for the account.
- Invalid or expired reset completions must guide the user back to
  `/reset-password` to request a fresh reset.
