# Implementation Plan: User Login And Account-Scoped Data

**Branch**: `006-user-login` | **Date**: 2026-04-08 | **Spec**: [/Users/cmaier/Source/tcg-tracker/specs/006-user-login/spec.md](/Users/cmaier/Source/tcg-tracker/specs/006-user-login/spec.md)
**Input**: Feature specification from `/specs/006-user-login/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add first-party user authentication to the existing Next.js portfolio tracker so
visitors can register, sign in, and sign out, while the app scopes portfolio
data and server-backed settings to the authenticated user instead of the
current hard-coded shared account. The implementation will introduce an auth
stack based on Auth.js plus Prisma-backed user/session tables, gate protected
routes at the server layer, and replace default-user portfolio/settings access
with session-derived user ownership.

## Technical Context

**Language/Version**: TypeScript 5.9 on Node.js 22 LTS  
**Primary Dependencies**: Next.js 16, React 19, Prisma ORM, Auth.js, Zod, password hashing library (`bcryptjs` or equivalent)  
**Storage**: PostgreSQL 17 for users, sessions, account-owned portfolio data, and account-owned Teams settings  
**Testing**: Vitest unit/integration tests, React Testing Library, Playwright end-to-end auth coverage, targeted manual verification for session flows  
**Target Platform**: Next.js web app running locally on Node.js 22 and on Azure App Service on Linux  
**Project Type**: Full-stack web application with server-rendered UI and API routes  
**Performance Goals**: Successful registration and sign-in submissions complete within 2 seconds once the page is loaded during local and production smoke checks, and protected-route session checks do not add noticeable latency beyond current portfolio/settings page loads  
**Constraints**: Preserve current portfolio behavior and the browser-local theme behavior after login adoption, require auth for portfolio/settings access, normalize email identifiers before comparison, avoid plain-text password storage, keep v1 limited to email/password auth, support only Teams alert preferences/history as account-backed settings, define an explicit atomic migration/bootstrap rule for existing shared data, allow concurrent sessions with current-session-only sign-out, and keep the deployed Azure App Service configuration limited to app-owned secrets and PostgreSQL connectivity without adding Microsoft Entra as a v1 dependency  
**Scale/Scope**: Multi-user support for account creation and sessions, per-user holdings and valuation snapshots, per-user Teams settings, and concurrent browser/device authenticated sessions for initial release

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Spec-first scope is defined: this plan references a concrete spec and does
      not start implementation from placeholders alone.
- [x] User stories remain independently valuable, priority-ordered, and
      independently testable.
- [x] Verification is defined for each story and for any foundational work that
      could block later validation.
- [x] Added complexity, dependencies, services, or directories are explicitly
      justified; simpler alternatives are noted when rejected.
- [x] Any changes to stack, structure, or commands are reflected in `README.md`,
      `AGENTS.md`, and related guidance files in the same change set.

## Project Structure

### Documentation (this feature)

```text
specs/006-user-login/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── auth.openapi.yaml
│   └── protected-routes.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── api/
│   ├── auth/
│   ├── portfolio/
│   └── settings/
├── login/page.tsx
├── register/page.tsx
├── portfolio/page.tsx
└── settings/page.tsx

components/
├── auth/
│   ├── login-form.tsx
│   ├── register-form.tsx
│   └── sign-out-button.tsx
└── settings/

lib/
├── auth/
│   ├── auth-config.ts
│   ├── auth-session.ts
│   ├── password.ts
│   └── route-guards.ts
├── portfolio/
├── settings/
└── teams/

prisma/
├── schema.prisma
└── migrations/

tests/
├── contract/
├── integration/
├── e2e/
└── unit/
```

**Structure Decision**: Keep the existing single Next.js application structure
and add a focused `lib/auth/` module plus auth UI/API routes. Replace the
current default-user helper pattern with session-aware user resolution so the
existing portfolio and Teams settings code can be updated without moving the
rest of the app into a separate backend/frontend split.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| New `lib/auth/` module | Centralizes session lookup, password hashing, and route guards without scattering auth decisions across portfolio/settings code | Reusing existing portfolio helpers directly would mix auth and domain logic and make route protection inconsistent |
| Auth.js dependency | Provides a maintained Next.js-native session/auth foundation with Prisma support | Rolling custom cookie/session auth would be smaller at first but increases security and maintenance risk |
| New user/session tables | Required for multi-user login and persistent authenticated sessions | Reusing the current single hard-coded `UserAccount` row cannot support user isolation or secure sign-in |

## Phase 0: Research Summary

- Authentication strategy: use Auth.js with a credentials provider and Prisma
  persistence for sessions and account lookups.
- Password handling: hash passwords with a one-way password hasher before
  persistence and validate them during sign-in without exposing raw passwords to
  app code after submission.
- Credential normalization: trim and lowercase email addresses before uniqueness
  checks and sign-in comparisons so duplicate-account behavior is deterministic.
- Deployment model: support the same first-party email/password flow in Azure
  App Service by supplying a stable `AUTH_SECRET`, production database
  connectivity, and HTTPS-backed secure session cookies, without requiring
  Microsoft Entra or a third-party identity provider for v1.
- Route protection: enforce auth at the server route/page boundary for
  portfolio/settings rather than relying only on client checks.
- Post-auth navigation: preserve a validated `returnTo` location for public
  card browsing pages and otherwise land authenticated users on `/portfolio`;
  sign-out returns the current browser session to `/login`.
- Existing data transition: assign the legacy shared portfolio/settings records
  to the first successfully registered account, with atomic claim handling so
  later registrations do not inherit the shared data.
- Session model: allow concurrent sessions for the same account, expire sessions
  after 30 days of inactivity, and invalidate only the current session on
  sign-out in v1.
- Observability: record structured auth audit events for failed sign-in,
  unauthorized protected-route access, and legacy-data-claim outcomes without
  exposing sensitive credentials or raw session tokens.

## Phase 1: Design Summary

- Extend the Prisma data model with credential/session entities needed for
  Auth.js and account-backed ownership of current user features.
- Define auth contracts for registration, login, sign-out, and protected route
  expectations.
- Document deployed-environment requirements for app-owned auth, including
  `AUTH_SECRET`, `DATABASE_URL`, secure production cookies, executed database
  migrations, and the absence of SMTP/password-reset requirements in v1.
- Update portfolio/settings data access to resolve the current authenticated
  user instead of the single default-user helper.
- Define exact protected portfolio/settings surfaces, sign-out redirect state,
  and return-to-public-page behavior so tests can verify page and API outcomes
  without implementation guesswork.
- Update agent context after plan generation with `SPECIFY_FEATURE=006-user-login`.

## Post-Design Constitution Check

- [x] Spec-first scope remains anchored to [/Users/cmaier/Source/tcg-tracker/specs/006-user-login/spec.md](/Users/cmaier/Source/tcg-tracker/specs/006-user-login/spec.md).
- [x] User stories still map cleanly to isolated slices: authentication,
      portfolio ownership, and settings ownership.
- [x] Verification is explicit in `quickstart.md` and will be backed by unit,
      integration, contract, and end-to-end coverage.
- [x] Added complexity is documented above with rejected simpler alternatives.
- [x] Eventual implementation must update repo guidance for new auth commands,
      env vars, and operator expectations in the same change set.
