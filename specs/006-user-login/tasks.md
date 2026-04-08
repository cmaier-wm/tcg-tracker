# Tasks: User Login And Account-Scoped Data

**Input**: Design documents from `/specs/006-user-login/`
**Prerequisites**: [plan.md](/Users/cmaier/Source/tcg-tracker/specs/006-user-login/plan.md) (required), [spec.md](/Users/cmaier/Source/tcg-tracker/specs/006-user-login/spec.md) (required), [research.md](/Users/cmaier/Source/tcg-tracker/specs/006-user-login/research.md), [data-model.md](/Users/cmaier/Source/tcg-tracker/specs/006-user-login/data-model.md), [contracts/](/Users/cmaier/Source/tcg-tracker/specs/006-user-login/contracts/)

**Tests**: Verification is required for each story. Prefer automated unit, integration, contract, and e2e coverage; keep `quickstart.md` aligned for explicit manual and production-smoke verification.

**Organization**: Tasks are grouped by user story so each slice can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story label for story-specific phases only (`[US1]`, `[US2]`, `[US3]`)
- Include exact file paths in every task description

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare dependencies, documentation surfaces, and auth-specific scaffolding used by all stories.

- [ ] T001 Add Auth.js and password-hashing dependencies in /Users/cmaier/Source/tcg-tracker/package.json
- [ ] T002 Add auth environment documentation for local and Azure deployment in /Users/cmaier/Source/tcg-tracker/README.md
- [ ] T003 [P] Add user-login feature guidance and commands in /Users/cmaier/Source/tcg-tracker/AGENTS.md
- [ ] T004 [P] Refine manual and production auth verification steps for validation, return-to-public-page flows, concurrent sessions, and deployment prerequisites in /Users/cmaier/Source/tcg-tracker/specs/006-user-login/quickstart.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the auth data model, session plumbing, and shared route-guard foundation before story work starts.

**⚠️ CRITICAL**: No user story work should begin until this phase is complete.

- [ ] T005 Extend account, credential, and session models for login ownership in /Users/cmaier/Source/tcg-tracker/prisma/schema.prisma
- [ ] T006 Create the user-login migration for credentials, sessions, and legacy-claim support in /Users/cmaier/Source/tcg-tracker/prisma/migrations/0004_user_login/migration.sql
- [ ] T007 [P] Add shared auth request/response schemas in /Users/cmaier/Source/tcg-tracker/lib/auth/schemas.ts
- [ ] T008 [P] Implement password hashing and verification helpers in /Users/cmaier/Source/tcg-tracker/lib/auth/password.ts
- [ ] T009 [P] Implement Auth.js configuration, secure cookie settings, inactivity-expiry policy, and session callbacks in /Users/cmaier/Source/tcg-tracker/lib/auth/auth-config.ts
- [ ] T010 [P] Implement authenticated-user lookup, current-session invalidation, and validated `returnTo` helpers in /Users/cmaier/Source/tcg-tracker/lib/auth/auth-session.ts
- [ ] T011 [P] Implement reusable page/API auth guards in /Users/cmaier/Source/tcg-tracker/lib/auth/route-guards.ts
- [ ] T012 Add Next.js auth route wiring in /Users/cmaier/Source/tcg-tracker/app/api/auth/[...nextauth]/route.ts
- [ ] T013 Add auth-aware legacy bootstrap claim service with atomic rollback semantics for the first registered user in /Users/cmaier/Source/tcg-tracker/lib/auth/legacy-bootstrap.ts
- [ ] T014 Update demo-store primitives for credential and session-aware local fallback behavior in /Users/cmaier/Source/tcg-tracker/lib/db/demo-store.ts

**Checkpoint**: Prisma, session resolution, and shared auth guards are ready for story implementation.

---

## Phase 3: User Story 1 - Create an account and sign in (Priority: P1) 🎯 MVP

**Goal**: Let any visitor register, automatically sign in, sign in later, persist the session across reloads, and sign out cleanly.

**Independent Test**: Register a new account, confirm auto-sign-in, reload with an active session, sign out, then sign in again with the same credentials and confirm invalid credentials fail.

### Verification for User Story 1

- [ ] T015 [P] [US1] Add auth contract tests for register, login, logout, validation failures, and normalized email handling in /Users/cmaier/Source/tcg-tracker/tests/contract/auth.contract.test.ts
- [ ] T016 [P] [US1] Add integration tests for valid registration, malformed or partial credential rejection, duplicate email rejection, normalized-email uniqueness, concurrent sessions, and session persistence in /Users/cmaier/Source/tcg-tracker/tests/integration/auth-session.test.ts
- [ ] T017 [P] [US1] Add end-to-end coverage for register/login/logout flows, signed-out redirect state, and public-page `returnTo` behavior in /Users/cmaier/Source/tcg-tracker/tests/e2e/auth.spec.ts

### Implementation for User Story 1

- [ ] T018 [US1] Implement registration endpoint with email normalization, email/password validation, optional public-page `returnTo`, and first-user legacy claim behavior in /Users/cmaier/Source/tcg-tracker/app/api/auth/register/route.ts
- [ ] T019 [US1] Implement login endpoint with normalized-email comparison, validation failures, and concurrent-session support in /Users/cmaier/Source/tcg-tracker/app/api/auth/login/route.ts
- [ ] T020 [US1] Implement logout endpoint with current-session invalidation and `/login` redirect behavior in /Users/cmaier/Source/tcg-tracker/app/api/auth/logout/route.ts
- [ ] T021 [P] [US1] Build the login form component in /Users/cmaier/Source/tcg-tracker/components/auth/login-form.tsx
- [ ] T022 [P] [US1] Build the registration form component in /Users/cmaier/Source/tcg-tracker/components/auth/register-form.tsx
- [ ] T023 [P] [US1] Build the authenticated sign-out control in /Users/cmaier/Source/tcg-tracker/components/auth/sign-out-button.tsx
- [ ] T024 [US1] Add the login page with signed-out redirect handling and validated public-page `returnTo` support in /Users/cmaier/Source/tcg-tracker/app/login/page.tsx
- [ ] T025 [US1] Add the registration page with auto-sign-in completion flow and validated public-page `returnTo` support in /Users/cmaier/Source/tcg-tracker/app/register/page.tsx
- [ ] T026 [US1] Update shared navigation to reflect signed-in versus signed-out auth state in /Users/cmaier/Source/tcg-tracker/components/site-nav.tsx

**Checkpoint**: User Story 1 is complete when account creation and sign-in work independently of portfolio/settings scoping.

---

## Phase 4: User Story 2 - Keep portfolio data private to the signed-in user (Priority: P2)

**Goal**: Scope portfolio pages and portfolio APIs to the authenticated user while leaving card browsing public.

**Independent Test**: Create two accounts, add different holdings under each, confirm `/portfolio` and `/api/portfolio/*` only expose the signed-in user’s holdings/history, and confirm signed-out access is redirected or rejected.

### Verification for User Story 2

- [ ] T027 [P] [US2] Update portfolio contract coverage for authenticated ownership and signed-out rejection in /Users/cmaier/Source/tcg-tracker/tests/contract/portfolio.contract.test.ts
- [ ] T028 [P] [US2] Add integration coverage for portfolio isolation across two accounts in /Users/cmaier/Source/tcg-tracker/tests/integration/portfolio-service.test.ts
- [ ] T029 [P] [US2] Update end-to-end portfolio flow coverage for authenticated ownership in /Users/cmaier/Source/tcg-tracker/tests/e2e/portfolio.spec.ts
- [ ] T030 [P] [US2] Add verification that card catalog and card detail browsing remain public while add-to-portfolio auth redirects preserve validated `returnTo` behavior in /Users/cmaier/Source/tcg-tracker/tests/e2e/cards-browse.spec.ts

### Implementation for User Story 2

- [ ] T031 [US2] Replace default-user portfolio resolution with session-derived ownership in /Users/cmaier/Source/tcg-tracker/lib/portfolio/db-portfolio.ts
- [ ] T032 [P] [US2] Update portfolio read/write services to require the authenticated user in /Users/cmaier/Source/tcg-tracker/lib/portfolio/get-portfolio.ts
- [ ] T033 [P] [US2] Update holding creation to scope records to the authenticated user in /Users/cmaier/Source/tcg-tracker/lib/portfolio/add-holding.ts
- [ ] T034 [P] [US2] Update holding updates and removals to scope records to the authenticated user in /Users/cmaier/Source/tcg-tracker/lib/portfolio/update-holding.ts
- [ ] T035 [P] [US2] Update holding deletions to scope records to the authenticated user in /Users/cmaier/Source/tcg-tracker/lib/portfolio/remove-holding.ts
- [ ] T036 [P] [US2] Update valuation snapshot ownership and history reads in /Users/cmaier/Source/tcg-tracker/lib/portfolio/save-valuation-snapshot.ts
- [ ] T037 [US2] Gate the portfolio page behind auth while preserving redirects for signed-out users in /Users/cmaier/Source/tcg-tracker/app/portfolio/page.tsx
- [ ] T038 [US2] Enforce session-based access for portfolio collection routes in /Users/cmaier/Source/tcg-tracker/app/api/portfolio/route.ts
- [ ] T039 [US2] Enforce session-based access for holding mutation routes in /Users/cmaier/Source/tcg-tracker/app/api/portfolio/[holdingId]/route.ts
- [ ] T040 [US2] Enforce session-based access for portfolio history routes in /Users/cmaier/Source/tcg-tracker/app/api/portfolio/history/route.ts
- [ ] T041 [US2] Keep card catalog browsing public while requiring auth for add-to-portfolio interactions and preserving validated `returnTo` destinations in /Users/cmaier/Source/tcg-tracker/components/portfolio/add-to-portfolio-button.tsx
- [ ] T042 [US2] Add expired-session write rejection coverage for portfolio mutations in /Users/cmaier/Source/tcg-tracker/tests/integration/portfolio-service.test.ts

**Checkpoint**: User Story 2 is complete when portfolio state is isolated per account and protected routes no longer fall back to the shared default user.

---

## Phase 5: User Story 3 - Keep settings private to the signed-in user (Priority: P3)

**Goal**: Scope server-backed settings, especially Teams alerts, to the authenticated user and protect settings surfaces behind login.

**Independent Test**: Configure different Teams settings under two accounts, confirm `/settings` and `/api/settings/teams-alert*` only expose the signed-in user’s data, and confirm signed-out access is redirected or rejected.

### Verification for User Story 3

- [ ] T043 [P] [US3] Update Teams settings contract coverage for authenticated ownership and signed-out rejection in /Users/cmaier/Source/tcg-tracker/tests/contract/teams-alert-settings.contract.test.ts
- [ ] T044 [P] [US3] Update settings-page contract coverage for protected settings access in /Users/cmaier/Source/tcg-tracker/tests/contract/settings-page.contract.test.tsx
- [ ] T045 [P] [US3] Add integration coverage for per-user Teams settings isolation in /Users/cmaier/Source/tcg-tracker/tests/integration/teams-alert-settings.test.ts
- [ ] T046 [P] [US3] Update end-to-end Teams settings flow for authenticated ownership in /Users/cmaier/Source/tcg-tracker/tests/e2e/teams-alerts.spec.ts
- [ ] T047 [P] [US3] Add expired-session write rejection coverage for account-backed settings in /Users/cmaier/Source/tcg-tracker/tests/integration/teams-alert-settings.test.ts

### Implementation for User Story 3

- [ ] T048 [US3] Replace default-user Teams preference resolution with session-derived ownership in /Users/cmaier/Source/tcg-tracker/lib/teams/alert-preferences.ts
- [ ] T049 [US3] Scope Teams alert evaluation and delivery reads to the authenticated owner in /Users/cmaier/Source/tcg-tracker/lib/teams/evaluate-portfolio-alert.ts
- [ ] T050 [US3] Gate the settings page behind auth while preserving browser-local theme behavior in /Users/cmaier/Source/tcg-tracker/app/settings/page.tsx
- [ ] T051 [US3] Update settings page composition for signed-in account-backed settings behavior in /Users/cmaier/Source/tcg-tracker/components/settings/settings-page.tsx
- [ ] T052 [US3] Update Teams settings UI to load and save the authenticated user’s data only in /Users/cmaier/Source/tcg-tracker/components/settings/teams-alert-settings.tsx
- [ ] T053 [US3] Enforce session-based access for Teams settings routes in /Users/cmaier/Source/tcg-tracker/app/api/settings/teams-alert/route.ts
- [ ] T054 [US3] Enforce session-based access for Teams settings history routes in /Users/cmaier/Source/tcg-tracker/app/api/settings/teams-alert/history/route.ts

**Checkpoint**: User Story 3 is complete when account-backed settings are isolated by authenticated user and protected settings routes reject signed-out access.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finish cross-story hardening, guidance synchronization, and release validation.

- [ ] T055 [P] Add unit coverage for password helpers and legacy-claim logic in /Users/cmaier/Source/tcg-tracker/tests/unit/auth-password.test.ts
- [ ] T056 [P] Add unit coverage for auth guard helpers in /Users/cmaier/Source/tcg-tracker/tests/unit/auth-session.test.ts
- [ ] T057 [P] Add structured auth audit logging for failed sign-in, unauthorized access, and legacy-claim outcomes in /Users/cmaier/Source/tcg-tracker/lib/auth/audit-log.ts
- [ ] T058 [P] Update MCP and development workflow guidance for login-related setup in /Users/cmaier/Source/tcg-tracker/docs/development/mcps.md
- [ ] T059 Run the full login verification suite and capture any manual verification deltas in /Users/cmaier/Source/tcg-tracker/specs/006-user-login/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Setup**: No dependencies; can start immediately.
- **Phase 2: Foundational**: Depends on Phase 1; blocks all user story work.
- **Phase 3: User Story 1**: Depends on Phase 2; delivers the MVP authentication slice.
- **Phase 4: User Story 2**: Depends on Phase 2; reuses the foundational auth/session primitives established there.
- **Phase 5: User Story 3**: Depends on Phase 2; reuses the foundational auth/session primitives established there.
- **Phase 6: Polish**: Depends on completion of the desired user stories.

### User Story Dependencies

- **US1 (P1)**: No dependency on later stories; establishes registration, sign-in, session persistence, and sign-out.
- **US2 (P2)**: Can start after Phase 2 and remains independently testable once implemented.
- **US3 (P3)**: Can start after Phase 2 and remains independently testable once implemented.

### Within Each User Story

- Verification tasks are defined before implementation tasks.
- Contract, integration, and e2e coverage should fail before implementation where feasible.
- Shared schema/session work lands before route handlers and UI integration.
- Route protection and user-scoping changes complete before final story validation.

### Parallel Opportunities

- Phase 1 tasks marked `[P]` can run in parallel.
- In Phase 2, schema helpers, password helpers, session helpers, and demo-store updates can be split across separate files.
- In US1, form components and contract/integration/e2e tests can be developed in parallel after foundational auth plumbing exists.
- In US2, portfolio service updates across separate files can run in parallel before route/page integration.
- In US3, contract/integration/e2e tests and Teams/settings UI changes can run in parallel once auth guards exist.

---

## Parallel Example: User Story 1

```bash
# Verification artifacts
Task: "Add auth contract tests in tests/contract/auth.contract.test.ts"
Task: "Add integration tests in tests/integration/auth-session.test.ts"
Task: "Add end-to-end coverage in tests/e2e/auth.spec.ts"

# UI components
Task: "Build login form component in components/auth/login-form.tsx"
Task: "Build registration form component in components/auth/register-form.tsx"
Task: "Build sign-out control in components/auth/sign-out-button.tsx"
```

## Parallel Example: User Story 2

```bash
# Portfolio services
Task: "Update portfolio reads in lib/portfolio/get-portfolio.ts"
Task: "Update add-holding in lib/portfolio/add-holding.ts"
Task: "Update update-holding in lib/portfolio/update-holding.ts"
Task: "Update remove-holding in lib/portfolio/remove-holding.ts"

# Verification artifacts
Task: "Update portfolio contract coverage in tests/contract/portfolio.contract.test.ts"
Task: "Add portfolio isolation integration coverage in tests/integration/portfolio-service.test.ts"
```

## Parallel Example: User Story 3

```bash
# Settings protection
Task: "Update Teams preference ownership in lib/teams/alert-preferences.ts"
Task: "Update settings page composition in components/settings/settings-page.tsx"
Task: "Enforce access in app/api/settings/teams-alert/route.ts"
Task: "Enforce access in app/api/settings/teams-alert/history/route.ts"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Validate registration, sign-in, session persistence, and sign-out independently.
5. Stop and review before expanding into portfolio/settings ownership.

### Incremental Delivery

1. Setup + Foundational establish auth/session infrastructure.
2. Deliver US1 and validate auth flows.
3. Deliver US2 and validate portfolio isolation.
4. Deliver US3 and validate settings isolation.
5. Finish with polish, documentation alignment, and full regression coverage.

### Parallel Team Strategy

1. One developer handles Prisma/auth plumbing while another prepares verification artifacts.
2. After Phase 2, one developer can own US1 UI/routes while others prepare US2 and US3 service/test changes.
3. Merge story slices after each independent validation checkpoint.

## Notes

- `[P]` tasks indicate separate-file work that can be parallelized safely.
- `[US1]`, `[US2]`, and `[US3]` map directly to the user stories in [spec.md](/Users/cmaier/Source/tcg-tracker/specs/006-user-login/spec.md).
- All task lines follow the required checklist format with checkbox, task ID, optional `[P]`, story label where required, and exact file paths.
