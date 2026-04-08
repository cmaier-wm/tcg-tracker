# Data Model: User Login And Account-Scoped Data

## UserCredential

- **Purpose**: Represents a collector who can authenticate into the app.
- **Attributes**:
  - `userId`: primary identifier tied to the existing `UserAccount`
  - `email`: unique login identifier
  - `passwordHash`: one-way password hash
  - `createdAt`
  - `updatedAt`
- **Relationships**:
  - Belongs to one `UserAccount`
  - Has many `AuthSession` records
- **Validation rules**:
  - `email` must be unique and normalized consistently
  - `passwordHash` must be present for credentials-based accounts

## AuthSession

- **Purpose**: Represents an authenticated browser session for a signed-in user.
- **Attributes**:
  - `id`
  - `userId`
  - `sessionToken`
  - `expiresAt`
  - `createdAt`
  - `updatedAt`
- **Relationships**:
  - Belongs to one `UserAccount`
- **Validation rules**:
  - `sessionToken` must be unique
  - expired sessions are not accepted for protected reads/writes

## UserAccount

- **Purpose**: Represents the app-level account owner for portfolio data and settings.
- **Attributes**:
  - existing `UserAccount` fields
  - `email` becomes a real user-owned identity field instead of the shared local default
  - `displayName` remains the user-facing label for portfolio/settings surfaces
- **Relationships**:
  - Has one `UserCredential`
  - Has many `PortfolioHolding`
  - Has many `PortfolioValuationSnapshot`
  - Has zero or one `TeamsAlertPreference`
- **Validation rules**:
  - portfolio/settings records must resolve to the authenticated `UserAccount`

## LegacyBootstrapAccount

- **Purpose**: Represents the explicit migration/bootstrap handling for the existing shared default account.
- **Attributes**:
  - legacy default `UserAccount` record
  - migration ownership status or bootstrap rule
- **Relationships**:
  - May seed one real `UserAccount` through a defined migration path
- **Validation rules**:
  - legacy records are not implicitly shared across authenticated accounts

## State Transitions

- **Visitor -> Registered**: valid email/password registration creates
  `UserAccount`, `UserCredential`, and active authenticated session.
- **Registered -> Authenticated**: valid credentials create or refresh an
  `AuthSession`.
- **Authenticated -> Signed Out**: sign-out invalidates the current session and
  removes protected access.
- **Legacy Default -> Explicitly Migrated**: legacy shared data is reassigned or
  retained only through a defined implementation rule, not through implicit
  auth behavior.
