# Data Model: Password Reset

## PasswordResetToken

**Purpose**: Represents a one-time recovery token issued for an existing
email/password account.

**Fields**:
- `id`: Unique identifier for the reset record
- `userId`: Owning account identifier
- `tokenHash`: One-way hash of the delivered reset secret
- `expiresAt`: Timestamp when the reset path is no longer valid
- `usedAt`: Timestamp when the token is successfully consumed
- `revokedAt`: Timestamp when the token is invalidated by a newer request
- `createdAt`: Record creation time

**Relationships**:
- Belongs to exactly one `UserAccount`

**Validation rules**:
- `tokenHash` must never store the raw delivered token
- A token is usable only when `usedAt` is null, `revokedAt` is null, and
  `expiresAt` is in the future
- New reset requests for the same `userId` revoke any older usable token

**State transitions**:
- `issued` -> `used` when the password reset succeeds
- `issued` -> `revoked` when a newer request is created for the same account
- `issued` -> `expired` when current time passes `expiresAt`

## UserAccount

**Purpose**: Existing account entity that owns credentials, sessions, portfolio
data, settings, and now password reset tokens.

**Additional reset-related rules**:
- Only accounts with a `UserCredential` are eligible for password reset
- A successful reset must preserve all existing portfolio holdings, valuation
  snapshots, Teams alert preferences, and Teams alert history

## UserCredential

**Purpose**: Existing email/password credential record for a user account.

**Additional reset-related rules**:
- Password reset replaces `passwordHash` with a new hash
- The new password must satisfy the same minimum password rules as registration
- The new password must not match the current password

## AuthSession

**Purpose**: Existing active authenticated browser/device session record.

**Additional reset-related rules**:
- All sessions for the affected `userId` are deleted after a successful
  password reset
- Session revocation happens in the same successful recovery flow that updates
  the password and consumes the reset token

## AuthAuditEvent

**Purpose**: Existing structured auth event log.

**Additional reset-related rules**:
- Records request acceptance, successful reset completion, invalid token usage,
  expired token attempts, and reset failures
- Must not include plaintext passwords, raw reset tokens, or session tokens
