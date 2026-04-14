# Implementation Plan: Password Reset

**Branch**: `009-password-reset` | **Date**: 2026-04-10 | **Spec**: [/Users/cmaier/.codex/worktrees/6c26/tcg-tracker/specs/009-password-reset/spec.md](/Users/cmaier/.codex/worktrees/6c26/tcg-tracker/specs/009-password-reset/spec.md)
**Input**: Feature specification from `/specs/009-password-reset/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add account recovery to the existing first-party email/password authentication
flow so signed-out users can request a password reset, receive a one-time
time-limited reset path, choose a new password, and regain access to their
existing portfolio and settings. The implementation will extend the current
custom auth/session stack with database-backed reset tokens, reset request and
completion surfaces, server-side reset delivery, and account-wide session
revocation after successful password changes.

## Technical Context

**Language/Version**: TypeScript 5.9 on Node.js 22 LTS  
**Primary Dependencies**: Next.js 16, React 19, Prisma ORM, Zod, `bcryptjs`, native Node `crypto`, existing app-owned auth/session helpers, and a transactional email delivery integration for production reset emails  
**Storage**: PostgreSQL 17 for users, credentials, sessions, audit events, and new password reset token records  
**Testing**: Vitest unit/integration/contract tests, React Testing Library for reset forms, Playwright end-to-end auth recovery coverage, and explicit manual verification for reset delivery flows  
**Target Platform**: Next.js web app running locally on Node.js 22 and on Azure App Service on Linux  
**Project Type**: Full-stack web application with server-rendered UI and API routes  
**Performance Goals**: Password reset request and completion submissions complete within 2 seconds once the page is loaded during local and production smoke checks, and reset email generation does not make the signed-out auth flow feel slower than current login/register interactions  
**Constraints**: Keep the existing app-owned auth/session model, preserve generic request responses that do not reveal account existence, hash reset secrets before persistence, expire reset paths after 30 minutes, allow only the most recent outstanding reset path per account, revoke all active sessions after a successful reset, require the new password to differ from the current password, keep portfolio/settings ownership unchanged, and provide a local developer reset-delivery path without depending on a live external mail service  
**Scale/Scope**: Recovery support for existing email/password accounts, one active reset flow per account at a time, signed-out request/completion pages, auth API routes, and verification coverage for success, invalid-token, expired-token, reused-token, and session-revocation paths

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
specs/009-password-reset/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── password-reset.openapi.yaml
│   └── reset-routes.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── api/
│   └── auth/
│       └── password-reset/
├── login/page.tsx
├── reset-password/page.tsx
└── reset-password/[token]/page.tsx

components/
└── auth/
    ├── forgot-password-form.tsx
    └── reset-password-form.tsx

lib/
├── auth/
│   ├── auth-config.ts
│   ├── auth-session.ts
│   ├── password.ts
│   ├── password-reset.ts
│   └── reset-delivery.ts
└── api/

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
and extend the current `lib/auth/` module with reset-token generation,
validation, delivery, and session-revocation logic. This avoids introducing a
new auth subsystem while keeping password recovery isolated from portfolio and
settings domain code.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| New password reset token persistence | Required to enforce time-limited, single-use recovery and invalidate older reset paths safely | Stateless reset links cannot support one-time use, revocation, or reliable expiry enforcement |
| Transactional email delivery integration | Required to send real recovery links to account email addresses in production | Manual/admin-issued reset links would not satisfy self-service password recovery |
| New reset UI/API surfaces | Needed to support both request and completion flows without overloading login/register behaviors | Folding reset into the login page alone would make token validation and error recovery harder to test and reason about |

## Phase 0: Research Summary

- Reset token model: use a dedicated database-backed password reset token record
  with a random secret delivered to the user and a hashed secret stored at rest.
- Expiry and revocation: make tokens valid for 30 minutes, mark them used after
  a successful reset, and revoke any older outstanding token when a newer reset
  request is issued for the same account.
- Delivery strategy: send reset links through a server-side transactional email
  integration in production, while local development logs the reset link for
  manual verification instead of requiring a live mail provider.
- Session security: delete all active `AuthSession` rows for the account after
  a successful reset so the new password becomes the single valid recovery
  path going forward.
- Route shape: expose a signed-out reset request page at `/reset-password`, a
  reset completion page at `/reset-password/[token]`, and matching auth API
  routes for request and completion.
- Auditability: reuse structured auth audit logging for request, invalid token,
  expiry, success, and failure outcomes without storing raw reset secrets.

## Phase 1: Design Summary

- Extend the Prisma data model with a `PasswordResetToken` entity tied to
  `UserAccount`.
- Add reset-request and reset-completion contracts that define generic request
  responses and exact invalid/expired token behavior.
- Keep login and registration flows intact while adding a reset entry point to
  the signed-out auth UI.
- Centralize reset token issuance, verification, consumption, and session
  revocation in `lib/auth/password-reset.ts`.
- Use a small reset-delivery abstraction so production emails and local
  development logging follow the same contract without polluting route code.
- Document the required production configuration for reset emails and the local
  manual verification path in `quickstart.md`.
- Update agent context after plan generation with `SPECIFY_FEATURE=009-password-reset`.

## Post-Design Constitution Check

- [x] Spec-first scope remains anchored to [/Users/cmaier/.codex/worktrees/6c26/tcg-tracker/specs/009-password-reset/spec.md](/Users/cmaier/.codex/worktrees/6c26/tcg-tracker/specs/009-password-reset/spec.md).
- [x] User stories still map cleanly to isolated slices: reset request,
      password replacement, and invalid-token safety behavior.
- [x] Verification is explicit in `quickstart.md` and will be backed by unit,
      integration, contract, and end-to-end coverage.
- [x] Added complexity is documented above with rejected simpler alternatives.
- [x] Eventual implementation must update repo guidance for reset-email config,
      auth recovery commands, and operator expectations in the same change set.
