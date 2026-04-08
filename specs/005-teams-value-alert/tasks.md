# Tasks: Microsoft Teams Portfolio Alerts

**Input**: Design documents from `/specs/005-teams-value-alert/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Verification tasks are REQUIRED. Prefer automated tests for logic,
contracts, and regressions. If automation is not practical, include explicit
manual verification tasks with commands, inputs, and expected outcomes.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- This feature extends the existing single Next.js application rooted at `app/`,
  `components/`, `lib/`, `prisma/`, and `tests/`.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish feature scaffolding and operator-facing prerequisites

- [X] T001 Create the feature task checklist and verify planned artifact paths in /Users/cmaier/Source/tcg-tracker/specs/005-teams-value-alert/tasks.md
- [X] T002 Add the Teams alert encryption environment variable documentation to /Users/cmaier/Source/tcg-tracker/specs/005-teams-value-alert/quickstart.md
- [X] T003 [P] Add a Teams alert contract test file scaffold in /Users/cmaier/Source/tcg-tracker/tests/contract/teams-alert-settings.contract.test.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core persistence, security, and service infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Update the Prisma schema for Teams alert preferences and delivery records in /Users/cmaier/Source/tcg-tracker/prisma/schema.prisma
- [X] T005 Create the Prisma migration for Teams alert persistence in /Users/cmaier/Source/tcg-tracker/prisma/migrations/
- [X] T006 [P] Implement Teams webhook encryption helpers in /Users/cmaier/Source/tcg-tracker/lib/teams/encrypt-webhook.ts
- [X] T007 [P] Implement Teams alert preference persistence helpers in /Users/cmaier/Source/tcg-tracker/lib/teams/alert-preferences.ts
- [X] T008 [P] Implement Teams webhook delivery helpers and payload formatting in /Users/cmaier/Source/tcg-tracker/lib/teams/alert-delivery.ts
- [X] T009 Implement portfolio alert threshold evaluation and delivery orchestration in /Users/cmaier/Source/tcg-tracker/lib/teams/evaluate-portfolio-alert.ts
- [X] T010 Integrate Teams alert preference access into the default-user portfolio data layer in /Users/cmaier/Source/tcg-tracker/lib/portfolio/db-portfolio.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Receive a gain alert in Teams (Priority: P1) 🎯 MVP

**Goal**: Deliver a Teams message when portfolio value rises more than $1,000 above the stored alert baseline

**Independent Test**: Enable Teams alerts with a valid workflow URL, trigger a qualifying portfolio increase through snapshot processing, and confirm exactly one Teams message is delivered with gain details

### Verification for User Story 1

- [X] T011 [P] [US1] Add unit tests for encryption, payload formatting, and threshold evaluation in /Users/cmaier/Source/tcg-tracker/tests/unit/teams-alerts.test.ts
- [X] T012 [P] [US1] Add an integration test for snapshot-triggered Teams alert delivery in /Users/cmaier/Source/tcg-tracker/tests/integration/teams-alert-delivery.test.ts
- [X] T013 [P] [US1] Implement the Teams alert settings contract test in /Users/cmaier/Source/tcg-tracker/tests/contract/teams-alert-settings.contract.test.ts
- [X] T014 [US1] Add a manual verification flow for qualifying gain delivery in /Users/cmaier/Source/tcg-tracker/specs/005-teams-value-alert/quickstart.md

### Implementation for User Story 1

- [X] T015 [P] [US1] Implement the Teams alert settings API route for reading and saving webhook configuration in /Users/cmaier/Source/tcg-tracker/app/api/settings/teams-alert/route.ts
- [X] T016 [P] [US1] Build the Teams alert settings client component in /Users/cmaier/Source/tcg-tracker/components/settings/teams-alert-settings.tsx
- [X] T017 [US1] Integrate the Teams alert settings section into /Users/cmaier/Source/tcg-tracker/components/settings/settings-page.tsx
- [X] T018 [US1] Trigger alert evaluation from valuation snapshot saves in /Users/cmaier/Source/tcg-tracker/lib/portfolio/save-valuation-snapshot.ts
- [X] T019 [US1] Surface alert delivery state on the settings route in /Users/cmaier/Source/tcg-tracker/app/settings/page.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Control whether alerts are active (Priority: P2)

**Goal**: Let the user enable or disable Teams alerts without losing the saved destination or causing unwanted outbound posts

**Independent Test**: Disable Teams alerts, trigger a qualifying portfolio increase, and confirm that no Teams message is sent; re-enable alerts and confirm future qualifying gains resume delivery

### Verification for User Story 2

- [X] T020 [P] [US2] Extend integration coverage for enabling and disabling alerts through the settings API in /Users/cmaier/Source/tcg-tracker/tests/integration/teams-alert-settings.test.ts
- [X] T021 [P] [US2] Add a settings page UI test for Teams alert toggle behavior in /Users/cmaier/Source/tcg-tracker/tests/integration/settings-page.test.tsx
- [X] T022 [US2] Add manual verification steps for disabling and re-enabling alerts in /Users/cmaier/Source/tcg-tracker/specs/005-teams-value-alert/quickstart.md

### Implementation for User Story 2

- [X] T023 [US2] Implement enable/disable state handling and baseline reset rules in /Users/cmaier/Source/tcg-tracker/lib/teams/alert-preferences.ts
- [X] T024 [US2] Add alert enable/disable controls and saved-destination UX in /Users/cmaier/Source/tcg-tracker/components/settings/teams-alert-settings.tsx
- [X] T025 [US2] Ensure the settings API persists disable/reenable behavior and returns current delivery status in /Users/cmaier/Source/tcg-tracker/app/api/settings/teams-alert/route.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Avoid duplicate notifications for the same gain range (Priority: P3)

**Goal**: Suppress duplicate Teams messages until the portfolio exceeds another $1,000 beyond the last successful alert baseline

**Independent Test**: Trigger one qualifying gain alert, rerun snapshot processing without another $1,000 increase, and confirm no duplicate message is sent; then exceed the next threshold and confirm one new message is delivered

### Verification for User Story 3

- [X] T026 [P] [US3] Add unit coverage for duplicate suppression and failed-delivery baseline behavior in /Users/cmaier/Source/tcg-tracker/tests/unit/teams-alerts.test.ts
- [X] T027 [P] [US3] Add an integration test for repeated snapshot runs and duplicate suppression in /Users/cmaier/Source/tcg-tracker/tests/integration/teams-alert-delivery.test.ts
- [X] T028 [P] [US3] Add an end-to-end scenario for duplicate prevention in /Users/cmaier/Source/tcg-tracker/tests/e2e/teams-alerts.spec.ts
- [X] T029 [US3] Add manual duplicate-suppression verification steps in /Users/cmaier/Source/tcg-tracker/specs/005-teams-value-alert/quickstart.md

### Implementation for User Story 3

- [X] T030 [US3] Persist delivery attempts and successful-baseline advancement rules in /Users/cmaier/Source/tcg-tracker/lib/teams/evaluate-portfolio-alert.ts
- [X] T031 [US3] Expose the latest alert delivery state on the portfolio/settings UI in /Users/cmaier/Source/tcg-tracker/components/settings/teams-alert-settings.tsx
- [X] T032 [US3] Ensure failed deliveries remain retryable while successful deliveries suppress duplicates in /Users/cmaier/Source/tcg-tracker/lib/portfolio/save-valuation-snapshot.ts

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T033 [P] Update feature-specific operator and developer guidance in /Users/cmaier/Source/tcg-tracker/README.md
- [X] T034 [P] Sync repository agent guidance for Teams alert setup expectations in /Users/cmaier/Source/tcg-tracker/AGENTS.md
- [X] T035 [P] Add any needed API serialization or error-shaping refinements for Teams alert responses in /Users/cmaier/Source/tcg-tracker/lib/api/serializers.ts
- [X] T036 Run the full verification suite for the feature and record results in /Users/cmaier/Source/tcg-tracker/specs/005-teams-value-alert/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - MVP slice
- **User Story 2 (P2)**: Can start after User Story 1 because it extends the same settings API and component surface
- **User Story 3 (P3)**: Can start after User Story 1 because it depends on established alert delivery and baseline persistence

### Within Each User Story

- Verification MUST be defined before implementation
- Automated tests for executable behavior MUST fail before implementation when feasible
- Persistence and service logic before API/UI wiring
- API/UI wiring before final integration into snapshot processing or product surfaces
- Story complete before moving to next priority

### Parallel Opportunities

- **Setup**: T003 can run in parallel with T001-T002
- **Foundational**: T006, T007, and T008 can run in parallel after T004-T005
- **User Story 1**: T011-T013 can run in parallel; T015 and T016 can run in parallel once foundational services exist
- **User Story 2**: T020 and T021 can run in parallel; T023 and T024 can run in parallel before T025
- **User Story 3**: T026-T028 can run in parallel; T030 and T031 can run in parallel before T032
- **Polish**: T033-T035 can run in parallel before T036

---

## Parallel Example: User Story 1

```bash
# Launch verification work for User Story 1 together:
Task: "Add unit tests for encryption, payload formatting, and threshold evaluation in tests/unit/teams-alerts.test.ts"
Task: "Add an integration test for snapshot-triggered Teams alert delivery in tests/integration/teams-alert-delivery.test.ts"
Task: "Implement the Teams alert settings contract test in tests/contract/teams-alert-settings.contract.test.ts"

# Launch implementation work for User Story 1 together:
Task: "Implement the Teams alert settings API route in app/api/settings/teams-alert/route.ts"
Task: "Build the Teams alert settings client component in components/settings/teams-alert-settings.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Run User Story 1 automated coverage and manual Teams delivery verification
5. Demo the feature before layering toggle refinements or duplicate-suppression polish

### Incremental Delivery

1. Complete Setup + Foundational → database, encryption, and Teams service layer ready
2. Add User Story 1 → Test independently → Deliver MVP
3. Add User Story 2 → Test independently → Deliver alert-control UX
4. Add User Story 3 → Test independently → Deliver duplicate-suppression behavior
5. Finish Polish → update guidance and run the full verification suite

### Parallel Team Strategy

With multiple developers:

1. Complete Setup + Foundational together
2. After foundation is ready:
   - Developer A: User Story 1 API and snapshot integration
   - Developer B: User Story 1/2 settings UI and tests
   - Developer C: User Story 3 duplicate-suppression logic and end-to-end verification

---

## Notes

- [P] tasks = different files, no dependencies
- [US1], [US2], and [US3] map directly to the prioritized stories in the feature spec
- Every task includes an exact target path so the list is immediately executable
- Suggested MVP scope: Phase 3 only (User Story 1)
