# Tasks: iOS Mobile App

**Input**: Design documents from `/specs/007-ios-mobile-app/`
**Prerequisites**: [plan.md](/Users/cmaier/.codex/worktrees/2b13/tcg-tracker/specs/007-ios-mobile-app/plan.md) (required), [spec.md](/Users/cmaier/.codex/worktrees/2b13/tcg-tracker/specs/007-ios-mobile-app/spec.md) (required), [research.md](/Users/cmaier/.codex/worktrees/2b13/tcg-tracker/specs/007-ios-mobile-app/research.md), [data-model.md](/Users/cmaier/.codex/worktrees/2b13/tcg-tracker/specs/007-ios-mobile-app/data-model.md), [contracts/](/Users/cmaier/.codex/worktrees/2b13/tcg-tracker/specs/007-ios-mobile-app/contracts/)

**Tests**: Verification is required for each story. Prefer focused Vitest contract and integration coverage for backend mobile routes, plus native-client unit coverage and explicit manual verification in `quickstart.md`.

**Organization**: Tasks are grouped by user story so each slice can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story label for story-specific phases only (`[US1]`, `[US2]`, `[US3]`, `[US4]`)
- Include exact file paths in every task description

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare documentation, ignore rules, and native project scaffolding used by all mobile stories.

- [X] T001 Add iOS mobile workflow and local setup guidance in /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/README.md
- [X] T002 [P] Add iOS mobile stack and workflow guidance in /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/AGENTS.md
- [X] T003 [P] Add Swift and Xcode build artifacts to ignore rules in /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/.gitignore
- [X] T004 Create the native app shell structure and Xcode project files under /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/ios/TCGTracker/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the backend mobile composition layer and shared native networking/state foundation before story work starts.

**⚠️ CRITICAL**: No user story work should begin until this phase is complete.

- [X] T005 Create shared mobile response types and summary composition helpers in /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/lib/mobile/
- [X] T006 Implement authenticated mobile session and signed-in summary routes in /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/app/api/mobile/
- [X] T007 [P] Add focused contract coverage for the new `/api/mobile/*` routes in /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/tests/contract/
- [X] T008 [P] Add integration coverage for composed signed-in summary behavior in /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/tests/integration/mobile-home.test.ts
- [X] T009 [P] Create native shared models and HTTP client foundations in /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/ios/TCGTracker/Models/ and /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/ios/TCGTracker/Networking/
- [X] T010 [P] Create native app state containers for auth, summary, browse, and portfolio refresh behavior in /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/ios/TCGTracker/State/
- [X] T011 [P] Add native unit coverage for shared request/response mapping and session handling in /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/ios/TCGTrackerTests/

**Checkpoint**: Backend mobile composition routes and native shared client/state layers are ready for story implementation.

---

## Phase 3: User Story 1 - Sign In And Review Collection Summary (Priority: P1) 🎯 MVP

**Goal**: Let a returning collector sign in on iPhone, restore signed-in state, and see a mobile-optimized summary or empty state for their collection.

**Independent Test**: Sign in from the native app, confirm the signed-in landing experience loads summary or empty state data, relaunch the app, and confirm the signed-in session persists until sign-out.

### Verification for User Story 1

- [X] T012 [P] [US1] Add contract coverage for mobile login/session summary expectations in /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/tests/contract/auth.contract.test.ts
- [X] T013 [P] [US1] Add backend integration coverage for signed-in summary and signed-out rejection flows in /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/tests/integration/auth-session.test.ts
- [X] T014 [P] [US1] Add native unit tests for sign-in state transitions and summary loading in /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/ios/TCGTrackerTests/

### Implementation for User Story 1

- [X] T015 [US1] Implement native auth feature models, view state, and sign-in form flow in /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/ios/TCGTracker/Features/Auth/
- [X] T016 [US1] Implement the signed-in landing summary feature and empty-state handling in /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/ios/TCGTracker/Features/Portfolio/
- [X] T017 [US1] Implement app shell routing between signed-out and signed-in states in /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/ios/TCGTracker/App/
- [X] T018 [US1] Add sign-out handling and session restoration behavior in /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/ios/TCGTracker/State/

**Checkpoint**: User Story 1 is complete when sign-in, sign-out, session restore, and signed-in summary/empty-state flows work independently.

---

## Phase 4: User Story 2 - Browse Cards And Inspect Pricing On Mobile (Priority: P1)

**Goal**: Let signed-in collectors browse cards, inspect card details, and view price history in a mobile layout aligned to the supplied design.

**Independent Test**: Open mobile browse, search for a known card, open card detail, confirm imagery, variation information, and price history render correctly, and confirm missing data produces intentional empty states.

### Verification for User Story 2

- [X] T019 [P] [US2] Add contract coverage for mobile card browse/detail/history payload expectations in /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/tests/contract/cards-search.contract.test.ts and /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/tests/contract/card-detail.contract.test.ts and /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/tests/contract/card-history.contract.test.ts
- [X] T020 [P] [US2] Add backend integration coverage for mobile browse/detail empty-state behavior in /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/tests/integration/cards-browse.test.tsx and /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/tests/integration/card-detail.test.tsx and /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/tests/integration/card-pricing.test.tsx
- [X] T021 [P] [US2] Add native unit coverage for browse search, detail mapping, and price-history presentation state in /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/ios/TCGTrackerTests/

### Implementation for User Story 2

- [X] T022 [US2] Implement the native browse feature and search-driven card list in /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/ios/TCGTracker/Features/Browse/
- [X] T023 [US2] Implement the native card-detail feature with variations and price-history presentation in /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/ios/TCGTracker/Features/CardDetail/
- [X] T024 [US2] Add shared mobile design primitives and chart presentation wrappers in /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/ios/TCGTracker/Design/
- [X] T025 [US2] Wire browse-to-detail navigation in the signed-in mobile shell in /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/ios/TCGTracker/App/

**Checkpoint**: User Story 2 is complete when browse and card detail are independently usable from the native app after sign-in.

---

## Phase 5: User Story 3 - Manage Portfolio Holdings From Mobile (Priority: P2)

**Goal**: Let signed-in collectors add holdings from card detail and update or remove holdings from the portfolio screen.

**Independent Test**: Add a card variation from detail, confirm it appears in portfolio, update quantity, remove it, and confirm the signed-in summary and portfolio totals refresh correctly.

### Verification for User Story 3

- [X] T026 [P] [US3] Add contract coverage for mobile holding add/update/remove payload expectations in /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/tests/contract/portfolio.contract.test.ts and /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/tests/contract/portfolio-history.contract.test.ts
- [X] T027 [P] [US3] Add backend integration coverage for mobile holding mutation refresh behavior in /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/tests/integration/portfolio-service.test.ts and /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/tests/integration/portfolio-page.test.tsx and /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/tests/integration/holding-form.test.tsx
- [X] T028 [P] [US3] Add native unit coverage for holding mutation state and summary refresh behavior in /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/ios/TCGTrackerTests/

### Implementation for User Story 3

- [X] T029 [US3] Implement add-to-portfolio interaction from native card detail in /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/ios/TCGTracker/Features/CardDetail/
- [X] T030 [US3] Implement the native portfolio holdings list with update and remove actions in /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/ios/TCGTracker/Features/Portfolio/
- [X] T031 [US3] Add native coordination so successful holding mutations refresh signed-in summary and portfolio data in /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/ios/TCGTracker/State/

**Checkpoint**: User Story 3 is complete when holdings can be added, edited, and removed from the native app with refreshed totals.

---

## Phase 6: User Story 4 - Adjust Personal Settings On Mobile (Priority: P3)

**Goal**: Let signed-in collectors review and update supported account-backed settings from the native app.

**Independent Test**: Open settings from the signed-in shell, update a supported alert value, save it, reload settings, and confirm the value persists; confirm signed-out users cannot reach protected settings.

### Verification for User Story 4

- [X] T032 [P] [US4] Add contract coverage for mobile settings read and update expectations in /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/tests/contract/teams-alert-settings.contract.test.ts and /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/tests/contract/settings-page.contract.test.tsx
- [X] T033 [P] [US4] Add backend integration coverage for account-backed settings updates and signed-out rejection in /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/tests/integration/teams-alert-settings.test.ts and /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/tests/integration/settings-page.test.tsx
- [X] T034 [P] [US4] Add native unit coverage for settings loading, saving, and signed-out protection behavior in /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/ios/TCGTrackerTests/

### Implementation for User Story 4

- [X] T035 [US4] Implement the native settings feature and supported alert configuration flow in /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/ios/TCGTracker/Features/Settings/
- [X] T036 [US4] Add settings navigation from the signed-in mobile shell in /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/ios/TCGTracker/App/

**Checkpoint**: User Story 4 is complete when account-backed settings can be managed from the signed-in native app.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Finish cross-story cleanup, workflow updates, and final verification alignment.

- [X] T037 [P] Add development tooling and MCP workflow guidance for the iOS project in /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/docs/development/mcps.md
- [X] T038 [P] Refine iOS-specific manual verification and production smoke notes in /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/specs/007-ios-mobile-app/quickstart.md
- [X] T039 [P] Add focused backend and native regression coverage for any shared mobile utilities in /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/tests/unit/ and /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/ios/TCGTrackerTests/
- [X] T040 Run the mobile feature verification suite and capture any remaining manual-validation deltas in /Users/cmaier/.codex/worktrees/2b13/tcg-tracker/specs/007-ios-mobile-app/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Setup**: No dependencies; can start immediately.
- **Phase 2: Foundational**: Depends on Phase 1; blocks all user story work.
- **Phase 3: User Story 1**: Depends on Phase 2; delivers the MVP signed-in mobile slice.
- **Phase 4: User Story 2**: Depends on Phase 2 and reuses the signed-in shell from US1.
- **Phase 5: User Story 3**: Depends on Phase 2 and integrates with browse/detail plus signed-in summary behavior.
- **Phase 6: User Story 4**: Depends on Phase 2 and reuses signed-in navigation plus account-backed settings routes.
- **Phase 7: Polish**: Depends on completion of the desired user stories.

### User Story Dependencies

- **US1 (P1)**: No dependency on later stories; establishes sign-in and signed-in summary.
- **US2 (P1)**: Can start after Phase 2 but is most useful once US1 signed-in routing exists.
- **US3 (P2)**: Depends functionally on US1 sign-in and US2 card detail entry points.
- **US4 (P3)**: Depends functionally on US1 sign-in and signed-in shell navigation.

### Within Each User Story

- Verification tasks are defined before implementation tasks.
- Backend contract and integration coverage should fail before implementation where feasible.
- Shared route and model changes land before native feature wiring.
- Story-specific native state handling completes before final manual validation.

### Parallel Opportunities

- Phase 1 tasks marked `[P]` can run in parallel.
- In Phase 2, backend mobile composition work and native shared-client foundations can be split across separate files.
- In US1, backend verification and native auth/shell state work can be divided across contributors after foundational work lands.
- In US2, browse and card-detail native features can be developed in parallel once shared networking and navigation scaffolding exist.
- In US4, backend settings verification and native settings UI can be worked in parallel after signed-in shell navigation is stable.

---

## Parallel Example: User Story 1

```bash
# Verification artifacts
Task: "Add contract coverage in tests/contract/auth.contract.test.ts"
Task: "Add backend integration coverage in tests/integration/auth-session.test.ts"
Task: "Add native unit coverage in ios/TCGTrackerTests/"

# Native feature work
Task: "Implement auth feature flow in ios/TCGTracker/Features/Auth/"
Task: "Implement signed-in shell routing in ios/TCGTracker/App/"
```

## Parallel Example: User Story 2

```bash
# Verification artifacts
Task: "Add contract coverage in tests/contract/cards-search.contract.test.ts"
Task: "Add integration coverage in tests/integration/cards-browse.test.tsx"
Task: "Add native unit coverage in ios/TCGTrackerTests/"

# Native feature work
Task: "Implement browse feature in ios/TCGTracker/Features/Browse/"
Task: "Implement card detail feature in ios/TCGTracker/Features/CardDetail/"
```

## Parallel Example: User Story 4

```bash
# Verification artifacts
Task: "Add settings contract coverage in tests/contract/teams-alert-settings.contract.test.ts"
Task: "Add settings integration coverage in tests/integration/teams-alert-settings.test.ts"

# Native feature work
Task: "Implement settings feature in ios/TCGTracker/Features/Settings/"
Task: "Add settings navigation in ios/TCGTracker/App/"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Validate sign-in, sign-out, session restore, and signed-in summary independently.
5. Stop and review before expanding into browse/detail and holding workflows.

### Incremental Delivery

1. Setup + Foundational establish the shared mobile backend boundary and native foundations.
2. Deliver US1 and validate the signed-in mobile entry slice.
3. Deliver US2 and validate browse/detail independently.
4. Deliver US3 and validate holding mutation flows.
5. Deliver US4 and validate account-backed settings.
6. Finish with polish, workflow updates, and full verification alignment.

### Parallel Team Strategy

1. One developer handles backend mobile composition and route verification while another establishes the native client foundations.
2. After Phase 2, one developer can own signed-in/auth shell work while another prepares browse/detail features.
3. Later stories can be split between portfolio and settings work once shared navigation is stable.

## Notes

- `[P]` tasks indicate separate-file work that can be parallelized safely.
- `[US1]`, `[US2]`, `[US3]`, and `[US4]` map directly to the user stories in [spec.md](/Users/cmaier/.codex/worktrees/2b13/tcg-tracker/specs/007-ios-mobile-app/spec.md).
- All task lines follow the required checklist format with checkbox, task ID, optional `[P]`, story label where required, and exact file paths.
- The suggested MVP scope is User Story 1 only.
