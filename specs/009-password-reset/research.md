# Research: Password Reset

## Decision: Store hashed password reset secrets in a dedicated token table

**Rationale**: A dedicated reset token record supports one-time use, expiry,
revocation of older requests, and auditability without storing raw recovery
secrets in the database. Hashing the delivered secret at rest matches the
existing approach of never persisting raw passwords or session tokens in usable
form.

**Alternatives considered**:
- Stateless signed reset URLs: rejected because they make one-time-use and
  revocation awkward and push too much security state into link validation.
- Reusing `AuthSession` rows: rejected because reset flows need different
  semantics, including generic request responses and explicit consumption.

## Decision: Keep reset tokens valid for 30 minutes and allow only the most recent one

**Rationale**: A short validity window limits recovery-link exposure while still
being practical for normal email delivery and manual testing. Invalidating older
outstanding tokens when a new request is made simplifies user expectations and
meets the spec requirement that older reset paths are no longer accepted once a
new one is issued.

**Alternatives considered**:
- Longer multi-hour expiry: rejected because it increases stale-link risk
  without strong user-value benefit for this app.
- Allowing multiple concurrent valid tokens: rejected because it weakens the
  security model and complicates reuse/invalid-token reasoning.

## Decision: Revoke all active sessions after successful password reset

**Rationale**: Password recovery should establish a clean security boundary.
Deleting all active sessions after a successful reset ensures that prior browser
sessions cannot continue using the account after the password has changed.

**Alternatives considered**:
- Revoke only the current browser session: rejected because reset usually
  happens while signed out and would leave older sessions active.
- Keep existing sessions alive: rejected because it undermines the purpose of a
  recovery flow after suspected credential loss.

## Decision: Use a server-side email delivery abstraction with local logging fallback

**Rationale**: Production password reset needs real email delivery to the
	account email address, while local development and manual verification should
not depend on a live mail provider. A reset-delivery module can send emails in
production and log the reset URL locally, while routes keep a single code path.

**Alternatives considered**:
- Hard-coding provider calls in API routes: rejected because it mixes delivery
  details with auth logic and makes tests harder to isolate.
- Requiring a local SMTP service for development: rejected because it adds
  unnecessary setup friction for this repo.

## Decision: Add dedicated reset request and completion pages

**Rationale**: Separate signed-out pages for requesting and completing a reset
keep recovery flows explicit, easier to validate, and less error-prone than
overloading the existing login form with token-aware state transitions.

**Alternatives considered**:
- Embedding reset request inline inside `/login` only: rejected because token
  completion still needs its own page and validation state.
- Using modal-only recovery UI: rejected because deep-link token completion is a
  first-class route and should not depend on client-side modal state.
