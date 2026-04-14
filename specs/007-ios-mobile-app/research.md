# Research: iOS Mobile App

## Decision: Build a native iOS client instead of extending the web UI alone

**Rationale**: The requested outcome is an iOS mobile version of the product,
and the supplied Figma Make design already describes a phone-first app
experience with mobile navigation and mobile layouts. A native client satisfies
that product request directly and avoids recasting a native design into a
browser-only experience.

**Alternatives considered**:

- Responsive web-only implementation: rejected because it would still be a web
  app rather than an iOS app.
- Web view shell around the current site: rejected because it preserves desktop
  interaction patterns and does not align cleanly with the provided mobile
  design reference.

## Decision: Keep the existing Next.js app as the only backend and system of record

**Rationale**: The current application already owns authentication, portfolio
data, card catalog access, pricing history, and Teams settings. Reusing that
backend avoids a second service boundary and keeps mobile behavior consistent
with the web app’s current account-backed logic.

**Alternatives considered**:

- Separate mobile backend: rejected because it duplicates business logic,
  deployment, and auth responsibilities with no v1 user benefit.
- Direct data access from the mobile app: rejected because it would bypass the
  current server-side auth and portfolio rules.

## Decision: Add only a minimal mobile-specific composition layer on the backend

**Rationale**: Most existing routes already align with mobile needs, but the
signed-in landing experience needs a composed summary payload rather than a
series of client-side calculations and chained route calls. A small
`/api/mobile/*` surface keeps that summary logic server-owned while keeping the
rest of the mobile app on existing route contracts.

**Alternatives considered**:

- Recompose the signed-in summary entirely in the client: rejected because it
  duplicates server-owned valuation logic and increases startup complexity.
- Build a brand-new parallel API for every mobile screen: rejected because it
  adds churn where current routes are already sufficient.

## Decision: Reuse current session-cookie authentication for the mobile client

**Rationale**: The current login/logout flow already creates and clears
authenticated sessions. Reusing that model keeps auth behavior consistent across
web and mobile and avoids introducing a second credential or token lifecycle
for the first release.

**Alternatives considered**:

- New bearer-token auth for mobile: rejected because it adds a second auth
  model without solving a feature requirement.
- Browser-based auth handoff only: rejected because it creates a weaker native
  user experience and adds avoidable app-flow complexity.

## Decision: Keep the first mobile release online-first and iPhone-only

**Rationale**: The mobile value depends on current account-backed portfolio and
pricing data. Staying online-first keeps the initial implementation smaller and
more trustworthy, while limiting the first release to supported iPhone layouts
matches the request for a tight implementation scope.

**Alternatives considered**:

- Offline-first local store with sync: rejected because it adds major
  complexity around auth, mutation queues, and stale portfolio state.
- iPad plus Android in the first pass: rejected because it expands design,
  testing, and navigation scope beyond the smallest useful delivery slice.

## Decision: Treat the linked Figma Make file as the authoritative mobile UX reference

**Rationale**: The user explicitly supplied the Figma Make file as the design to
follow. Anchoring the plan to that file keeps navigation and layout decisions
traceable and reduces unnecessary interpretation drift during implementation.

**Alternatives considered**:

- Re-derive mobile UX only from current web pages: rejected because it ignores
  the provided mobile design reference.
- Treat Figma only as styling guidance: rejected because it would leave mobile
  navigation and information hierarchy underspecified.
