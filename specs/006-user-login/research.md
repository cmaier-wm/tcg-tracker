# Research: User Login And Account-Scoped Data

## Decision: Use Auth.js with a credentials provider and Prisma-backed persistence

**Rationale**: The app is already a Next.js web application and needs
server-side route protection, durable sessions, and user ownership of existing
database-backed features. Auth.js fits the current stack, works cleanly with
Next.js server components and route handlers, and avoids inventing a custom
session layer.

**Alternatives considered**:

- Custom cookie/session auth: rejected because it adds avoidable security and
  maintenance risk for password handling, session expiry, and route protection.
- OAuth-only login: rejected because the requested feature is simply “users can
  log in,” and email/password is the smallest first-party implementation that
  does not require third-party app registration.

## Decision: Normalize email identifiers before uniqueness checks and sign-in

**Rationale**: The app treats email as the unique login identifier, so
registration and sign-in need one deterministic comparison rule. Trimming
surrounding whitespace and comparing lowercase values prevents duplicate-account
ambiguity such as `User@Example.com` versus `user@example.com`.

**Alternatives considered**:

- Case-sensitive comparison: rejected because it creates inconsistent
  uniqueness behavior and avoidable user confusion.
- Preserving raw casing without normalized comparison: rejected because users
  would have to guess the stored casing during sign-in.

## Decision: Keep v1 authentication app-owned in the deployed Azure App Service environment

**Rationale**: The product requirement is user login plus user-scoped portfolio
and settings, not enterprise identity federation. Auth.js credentials-based
login backed by Prisma and PostgreSQL works in the deployed Azure App Service
environment as long as the app has a stable `AUTH_SECRET`, production database
connectivity, and HTTPS-backed secure cookies. This keeps deployment within the
existing app/service boundary and avoids blocking the feature on Microsoft
Entra tenant setup.

**Alternatives considered**:

- Microsoft Entra ID / Azure AD in v1: rejected because it adds tenant, app
  registration, consent, and redirect-URI setup that are not required to meet
  the current product need.
- Waiting for email infrastructure before login rollout: rejected because
  registration and sign-in do not require SMTP unless password reset or email
  verification is added to scope.

## Decision: Scope portfolio and Teams settings from the authenticated session, not a fallback default user

**Rationale**: The user request is specifically about associating the current
user-facing features with the logged-in user. The app therefore needs a single
session-derived source of truth for user identity across portfolio reads/writes
and settings reads/writes.

**Alternatives considered**:

- Keep using the hard-coded default user and attach auth later: rejected because
  it preserves the current shared-data bug the feature is meant to remove.
- Pass user ids through client props only: rejected because protected server
  routes still need trusted session-derived identity.

## Decision: Store password hashes with a one-way password hasher

**Rationale**: Passwords are credential material and must never be stored in
plain text. A standard password hashing library with per-password salt is the
minimum acceptable approach for first-party email/password auth.

**Alternatives considered**:

- Reversible encryption: rejected because authentication requires comparison,
  not recovery, and reversible secrets increase breach impact.
- Plain text or unsalted hash storage: rejected because it is not acceptable
  for production credentials.

## Decision: Protect portfolio and settings at the server boundary

**Rationale**: Portfolio APIs, settings APIs, and server-rendered pages already
perform privileged reads and writes. Authentication checks need to happen before
those operations run so users cannot bypass UI checks with direct route access.

**Alternatives considered**:

- Client-only route guards: rejected because route handlers would still accept
  unauthenticated requests if called directly.
- Middleware-only protection for all routes: rejected for v1 because the app
  still needs some public pages and route-level checks keep the initial scope
  clearer.

## Decision: Preserve public browsing context through authentication

**Rationale**: Card catalog and card detail browsing remain public, but those
surfaces may offer add-to-portfolio entry points that require auth. Preserving
an allowlisted `returnTo` destination back to the public browsing page keeps
the auth flow from losing the user’s place.

**Alternatives considered**:

- Always landing on `/portfolio` after auth: rejected because it discards the
  user’s browsing context when auth started from a public card page.
- Allowing arbitrary redirect destinations: rejected because it increases open
  redirect risk and makes post-auth behavior harder to reason about.

## Decision: Allow concurrent sessions but scope sign-out to the current session

**Rationale**: Supporting multiple browsers/devices is useful without requiring
account-management UI in v1. Invalidating only the current session keeps
sign-out behavior simple and predictable.

**Alternatives considered**:

- Single-session-only accounts: rejected because it adds friction without
  improving portfolio/settings isolation.
- Global sign-out on every logout: rejected because v1 does not include full
  session management and cross-device revocation is not required.

## Decision: Let the first successful registration claim the legacy shared default-account data

**Rationale**: The existing repository was built around a single default user.
The spec now makes that legacy data transfer concrete: the first successfully
registered account becomes the owner of the existing shared portfolio and
account-backed settings. Implementation still needs atomic claim handling so
two near-simultaneous registrations cannot both inherit the shared records.

**Alternatives considered**:

- Leaving legacy handling unspecified until implementation: rejected because it
  creates drift between the clarified spec and the implementation plan.
- Automatically copy legacy data into later accounts: rejected because it would
  violate user-data isolation and silently duplicate shared state.
- Delete legacy data during auth rollout: rejected because it risks silent data
  loss and complicates local/dev continuity.

## Decision: Emit structured auth audit events without sensitive payloads

**Rationale**: Failed sign-in attempts, unauthorized portfolio/settings access,
and legacy-claim outcomes are operationally important during rollout. Logging
those events in a structured way helps validation and debugging as long as
passwords, password hashes, and raw session tokens never appear in logs.

**Alternatives considered**:

- No auth-specific logging: rejected because rollout issues would be harder to
  diagnose and verify.
- Logging full request bodies for auth failures: rejected because it would risk
  leaking secrets and credential material.
