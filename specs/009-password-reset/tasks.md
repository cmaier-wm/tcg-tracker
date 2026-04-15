# Tasks: Password Reset

**Input**: Design documents from `/specs/009-password-reset/`
**Prerequisites**: [plan.md](/Users/cmaier/.codex/worktrees/6c26/tcg-tracker/specs/009-password-reset/plan.md) (required), [spec.md](/Users/cmaier/.codex/worktrees/6c26/tcg-tracker/specs/009-password-reset/spec.md) (required), [research.md](/Users/cmaier/.codex/worktrees/6c26/tcg-tracker/specs/009-password-reset/research.md), [data-model.md](/Users/cmaier/.codex/worktrees/6c26/tcg-tracker/specs/009-password-reset/data-model.md), [contracts/](/Users/cmaier/.codex/worktrees/6c26/tcg-tracker/specs/009-password-reset/contracts/)

**Tests**: Verification is required for each story. Prefer automated unit, integration, contract, and e2e coverage; keep `quickstart.md` aligned for explicit manual verification.

**Retroactive Parity Note**: Add native iOS verification and implementation for
password-reset request and completion behavior.

**Organization**: Tasks are grouped by user story so each slice can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story label for story-specific phases only (`[US1]`, `[US2]`, `[US3]`)
- Include exact file paths in every task description

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare dependencies, docs, and recovery-specific guidance used by all stories.

- [X] T001 Add password-reset delivery configuration documentation in /Users/cmaier/.codex/worktrees/6c26/tcg-tracker/README.md
- [X] T002 [P] Add password-reset feature guidance and commands in /Users/cmaier/.codex/worktrees/6c26/tcg-tracker/AGENTS.md
- [X] T003 [P] Refine reset manual verification steps and local log-based recovery guidance in /Users/cmaier/.codex/worktrees/6c26/tcg-tracker/specs/009-password-reset/quickstart.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared token persistence, validation, delivery, and auth plumbing before user-story work starts.

**⚠️ CRITICAL**: No user story work should begin until this phase is complete.

- [X] T004 Extend the auth data model with password reset token ownership in /Users/cmaier/.codex/worktrees/6c26/tcg-tracker/prisma/schema.prisma
- [X] T005 Create the password-reset migration in /Users/cmaier/.codex/worktrees/6c26/tcg-tracker/prisma/migrations/
- [X] T006 [P] Add shared password-reset request and confirm schemas in /Users/cmaier/.codex/worktrees/6c26/tcg-tracker/lib/auth/schemas.ts
- [X] T007 [P] Add reset token expiry and route constants in /Users/cmaier/.codex/worktrees/6c26/tcg-tracker/lib/auth/auth-config.ts
- [X] T008 [P] Implement reset token issuance, verification, consumption, revocation, and session deletion in /Users/cmaier/.codex/worktrees/6c26/tcg-tracker/lib/auth/password-reset.ts
- [X] T009 [P] Implement reset email delivery and local log fallback in /Users/cmaier/.codex/worktrees/6c26/tcg-tracker/lib/auth/reset-delivery.ts
- [X] T010 [P] Extend auth audit logging for password reset outcomes in /Users/cmaier/.codex/worktrees/6c26/tcg-tracker/lib/auth/audit-log.ts
- [X] T011 Update demo-store and local auth fallback support for password reset tokens and session revocation in /Users/cmaier/.codex/worktrees/6c26/tcg-tracker/lib/db/demo-store.ts

**Checkpoint**: Token persistence, shared reset helpers, and delivery plumbing are ready for story implementation.

---

## Phase 3: User Story 1 - Request a reset link (Priority: P1) 🎯 MVP

**Goal**: Let signed-out users request a password reset from the auth flow and receive a generic confirmation without revealing whether an account exists.

**Independent Test**: Submit a registered email and an unregistered email through the reset request flow, confirm the same success response is shown for both, and verify only the registered account gets a usable reset path in the local log or delivery channel.

### Verification for User Story 1

- [X] T012 [P] [US1] Add contract coverage for generic password-reset request responses in /Users/cmaier/.codex/worktrees/6c26/tcg-tracker/tests/contract/password-reset.contract.test.ts
- [X] T013 [P] [US1] Add integration coverage for reset token issuance and non-enumerating request behavior in /Users/cmaier/.codex/worktrees/6c26/tcg-tracker/tests/integration/password-reset.test.ts
- [X] T014 [P] [US1] Add form coverage for reset-request validation and confirmation messaging in /Users/cmaier/.codex/worktrees/6c26/tcg-tracker/tests/integration/forgot-password-form.test.tsx
- [X] T015 [P] [US1] Add end-to-end coverage for requesting a reset from the signed-out auth experience in /Users/cmaier/.codex/worktrees/6c26/tcg-tracker/tests/e2e/password-reset.spec.ts

### Implementation for User Story 1

- [X] T016 [US1] Implement the password-reset request API route in /Users/cmaier/.codex/worktrees/6c26/tcg-tracker/app/api/auth/password-reset/request/route.ts
- [X] T017 [P] [US1] Build the forgot-password form component in /Users/cmaier/.codex/worktrees/6c26/tcg-tracker/components/auth/forgot-password-form.tsx
- [X] T018 [US1] Add the password-reset request page with signed-in redirect handling in /Users/cmaier/.codex/worktrees/6c26/tcg-tracker/app/reset-password/page.tsx
- [X] T019 [US1] Add a password-reset entry point to the signed-out login experience in /Users/cmaier/.codex/worktrees/6c26/tcg-tracker/app/login/page.tsx

**Checkpoint**: User Story 1 is complete when signed-out users can request a reset without learning whether an email address exists.

---

## Phase 4: User Story 2 - Set a new password (Priority: P2)

**Goal**: Allow a user with a valid reset path to choose a compliant new password, revoke existing sessions, and sign in again without losing account-owned data.

**Independent Test**: Open a valid reset path, set a compliant new password, confirm the new password works, confirm the old password fails, and verify the account still owns the same portfolio/settings data.

### Verification for User Story 2

- [X] T020 [P] [US2] Extend password-reset contract coverage for successful reset completion in /Users/cmaier/.codex/worktrees/6c26/tcg-tracker/tests/contract/password-reset.contract.test.ts
- [X] T021 [P] [US2] Add integration coverage for successful password replacement, current-password rejection, and session revocation in /Users/cmaier/.codex/worktrees/6c26/tcg-tracker/tests/integration/password-reset.test.ts
- [X] T022 [P] [US2] Add form coverage for reset-password validation messaging in /Users/cmaier/.codex/worktrees/6c26/tcg-tracker/tests/integration/reset-password-form.test.tsx
- [X] T023 [P] [US2] Extend end-to-end coverage for successful password reset and subsequent sign-in in /Users/cmaier/.codex/worktrees/6c26/tcg-tracker/tests/e2e/password-reset.spec.ts

### Implementation for User Story 2

- [X] T024 [US2] Implement the password-reset confirm API route in /Users/cmaier/.codex/worktrees/6c26/tcg-tracker/app/api/auth/password-reset/confirm/route.ts
- [X] T025 [P] [US2] Build the reset-password form component in /Users/cmaier/.codex/worktrees/6c26/tcg-tracker/components/auth/reset-password-form.tsx
- [X] T026 [US2] Add the reset-password completion page with signed-in redirect handling in /Users/cmaier/.codex/worktrees/6c26/tcg-tracker/app/reset-password/[token]/page.tsx
- [X] T027 [US2] Update login failure and session helpers for post-reset sign-in behavior in /Users/cmaier/.codex/worktrees/6c26/tcg-tracker/app/api/auth/login/route.ts

**Checkpoint**: User Story 2 is complete when a valid reset path can replace the password, revoke sessions, and restore access with the new password only.

---

## Phase 5: User Story 3 - Handle expired or reused reset paths safely (Priority: P3)

**Goal**: Reject stale, malformed, revoked, or already-used reset paths with actionable guidance to request a new reset.

**Independent Test**: Attempt reset completion with expired, reused, malformed, and superseded tokens, confirm each attempt is rejected, and verify the user is directed back to request a fresh reset.

### Verification for User Story 3

- [X] T028 [P] [US3] Extend password-reset contract coverage for expired and invalid token responses in /Users/cmaier/.codex/worktrees/6c26/tcg-tracker/tests/contract/password-reset.contract.test.ts
- [X] T029 [P] [US3] Add integration coverage for token expiry, token reuse, and superseded-token rejection in /Users/cmaier/.codex/worktrees/6c26/tcg-tracker/tests/integration/password-reset.test.ts
- [X] T030 [P] [US3] Extend end-to-end coverage for expired and reused reset paths in /Users/cmaier/.codex/worktrees/6c26/tcg-tracker/tests/e2e/password-reset.spec.ts

### Implementation for User Story 3

- [X] T031 [US3] Add invalid-token and expired-token recovery states to the reset-password completion page in /Users/cmaier/.codex/worktrees/6c26/tcg-tracker/app/reset-password/[token]/page.tsx
- [X] T032 [US3] Add actionable invalid-path recovery messaging to the reset-password form component in /Users/cmaier/.codex/worktrees/6c26/tcg-tracker/components/auth/reset-password-form.tsx
- [X] T033 [US3] Harden token validation and supersession behavior in /Users/cmaier/.codex/worktrees/6c26/tcg-tracker/lib/auth/password-reset.ts

**Checkpoint**: User Story 3 is complete when every invalid or stale reset path fails safely and points users to request a new reset.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finish unit coverage, guidance sync, and end-to-end verification across all stories.

- [X] T034 [P] Add unit coverage for reset token hashing, expiry, and reuse helpers in /Users/cmaier/.codex/worktrees/6c26/tcg-tracker/tests/unit/password-reset.test.ts
- [X] T035 [P] Update MCP and development workflow guidance for password reset delivery setup in /Users/cmaier/.codex/worktrees/6c26/tcg-tracker/docs/development/mcps.md
- [X] T036 Run the full password-reset verification suite and capture any manual-verification deltas in /Users/cmaier/.codex/worktrees/6c26/tcg-tracker/specs/009-password-reset/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Setup**: No dependencies; can start immediately.
- **Phase 2: Foundational**: Depends on Phase 1; blocks all user story work.
- **Phase 3: User Story 1**: Depends on Phase 2; delivers the MVP recovery-request slice.
- **Phase 4: User Story 2**: Depends on Phase 2 and uses the shared token/delivery foundation from Phase 2 plus request flows from US1.
- **Phase 5: User Story 3**: Depends on Phase 2 and hardens the completion flow created in US2.
- **Phase 6: Polish**: Depends on completion of the desired user stories.

### User Story Dependencies

- **US1 (P1)**: No dependency on later stories; establishes reset-request entry and generic request handling.
- **US2 (P2)**: Depends on the reset-token issuance path from US1 to provide a valid completion flow.
- **US3 (P3)**: Depends on US2 because invalid/expired/reused outcomes are part of the completion surface.

### Within Each User Story

- Verification tasks are defined before implementation tasks.
- Contract, integration, form, and e2e coverage should fail before implementation where feasible.
- Shared token and delivery helpers land before route handlers and UI integration.
- Route behavior and validation messaging complete before final story validation.

### Parallel Opportunities

- Phase 1 tasks marked `[P]` can run in parallel.
- In Phase 2, schema updates, auth config, reset service, delivery service, and audit logging can be split across separate files.
- In US1, contract/integration/form/e2e verification tasks can run in parallel, and the request page and form component can be built in parallel after the API route contract is clear.
- In US2, form coverage and e2e coverage can run in parallel, and the completion page and form component can be built in parallel once the confirm route exists.
- In US3, invalid-token contract/integration/e2e coverage can run in parallel while token-hardening work proceeds in the shared reset service.

---

## Parallel Example: User Story 1

```bash
# Verification artifacts
Task: "Add contract coverage in tests/contract/password-reset.contract.test.ts"
Task: "Add integration coverage in tests/integration/password-reset.test.ts"
Task: "Add form coverage in tests/integration/forgot-password-form.test.tsx"
Task: "Add end-to-end coverage in tests/e2e/password-reset.spec.ts"

# UI work
Task: "Build forgot-password form component in components/auth/forgot-password-form.tsx"
Task: "Add reset-password request page in app/reset-password/page.tsx"
```

## Parallel Example: User Story 2

```bash
# Verification artifacts
Task: "Extend contract coverage in tests/contract/password-reset.contract.test.ts"
Task: "Add integration coverage in tests/integration/password-reset.test.ts"
Task: "Add form coverage in tests/integration/reset-password-form.test.tsx"

# UI work
Task: "Build reset-password form component in components/auth/reset-password-form.tsx"
Task: "Add reset-password completion page in app/reset-password/[token]/page.tsx"
```

## Parallel Example: User Story 3

```bash
# Invalid-token verification
Task: "Extend contract coverage in tests/contract/password-reset.contract.test.ts"
Task: "Add integration coverage in tests/integration/password-reset.test.ts"
Task: "Extend end-to-end coverage in tests/e2e/password-reset.spec.ts"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Validate reset-request behavior independently.
5. Stop and review before adding completion and invalid-token handling.

### Incremental Delivery

1. Setup + Foundational establish token persistence, delivery, and audit plumbing.
2. Deliver US1 and validate generic request handling.
3. Deliver US2 and validate successful password replacement and session revocation.
4. Deliver US3 and validate expiry/reuse/revocation safety behavior.
5. Finish with polish, documentation alignment, and full regression coverage.

### Parallel Team Strategy

1. One developer handles Prisma/reset-service plumbing while another prepares verification artifacts.
2. After Phase 2, one developer can own US1 request UI/API while another prepares US2 completion coverage.
3. After US1 lands, one developer can own US2 completion flow while another hardens invalid-token cases for US3.

## Notes

- `[P]` tasks indicate separate-file work that can be parallelized safely.
- `[US1]`, `[US2]`, and `[US3]` map directly to the user stories in [spec.md](/Users/cmaier/.codex/worktrees/6c26/tcg-tracker/specs/009-password-reset/spec.md).
- All task lines follow the required checklist format with checkbox, task ID, optional `[P]`, story label where required, and exact file paths.
