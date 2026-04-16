# Tasks: Portfolio Spreadsheet Export

**Input**: Design documents from `/specs/008-portfolio-spreadsheet-export/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Verification tasks are REQUIRED. Prefer automated tests for logic,
contracts, and regressions. If automation is not practical, include explicit
manual verification tasks with commands, inputs, and expected outcomes.

**Retroactive Parity Note**: Verify export remains available on desktop web and
absent from iOS as an approved exception.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the feature artifacts and route/test targets are aligned before code changes begin

- [X] T001 Review `/Users/cmaier/.codex/worktrees/f921/tcg-tracker/specs/008-portfolio-spreadsheet-export/plan.md`, `/Users/cmaier/.codex/worktrees/f921/tcg-tracker/specs/008-portfolio-spreadsheet-export/contracts/portfolio-export.openapi.yaml`, and `/Users/cmaier/.codex/worktrees/f921/tcg-tracker/specs/008-portfolio-spreadsheet-export/contracts/portfolio-export-ui.md` to lock the CSV export scope and response contract

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared export plumbing that all user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 Create shared portfolio export row mapping, CSV escaping, and filename generation in `/Users/cmaier/.codex/worktrees/f921/tcg-tracker/lib/portfolio/export-portfolio.ts`
- [X] T003 Create the authenticated export route in `/Users/cmaier/.codex/worktrees/f921/tcg-tracker/app/api/portfolio/export/route.ts`
- [X] T004 [P] Add base route coverage for authenticated CSV success and generic failure handling in `/Users/cmaier/.codex/worktrees/f921/tcg-tracker/tests/integration/portfolio-export-route.test.ts`
- [X] T005 [P] Add contract coverage for `/api/portfolio/export` response headers and empty-state payload in `/Users/cmaier/.codex/worktrees/f921/tcg-tracker/tests/contract/portfolio-export.contract.test.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Download My Portfolio Spreadsheet (Priority: P1) 🎯 MVP

**Goal**: Let a signed-in collector trigger a spreadsheet-compatible portfolio download from the portfolio page

**Independent Test**: Sign in with holdings, export from `/portfolio`, open the downloaded file, and confirm readable headers plus one row per holding

### Verification for User Story 1

- [X] T006 [P] [US1] Extend export route verification for full-row CSV content and all-holdings export ordering in `/Users/cmaier/.codex/worktrees/f921/tcg-tracker/tests/integration/portfolio-export-route.test.ts`
- [X] T007 [P] [US1] Add UI interaction coverage for download success behavior, including the success toast, in `/Users/cmaier/.codex/worktrees/f921/tcg-tracker/tests/integration/portfolio-export-button.test.tsx`
- [X] T008 [US1] Add end-to-end export download coverage from `/portfolio` in `/Users/cmaier/.codex/worktrees/f921/tcg-tracker/tests/e2e/portfolio.spec.ts`

### Implementation for User Story 1

- [X] T009 [US1] Implement portfolio export route support for all account holdings and CSV response headers in `/Users/cmaier/.codex/worktrees/f921/tcg-tracker/app/api/portfolio/export/route.ts`
- [X] T010 [P] [US1] Implement database-backed and demo-fallback export row shaping in `/Users/cmaier/.codex/worktrees/f921/tcg-tracker/lib/portfolio/export-portfolio.ts`
- [X] T011 [US1] Add the portfolio export client trigger and success toast in `/Users/cmaier/.codex/worktrees/f921/tcg-tracker/components/portfolio/portfolio-export-button.tsx`
- [X] T012 [US1] Surface the export control from the portfolio page in `/Users/cmaier/.codex/worktrees/f921/tcg-tracker/app/portfolio/page.tsx`
- [X] T013 [US1] Add any export-control layout adjustments needed for the portfolio header in `/Users/cmaier/.codex/worktrees/f921/tcg-tracker/app/globals.css`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Export Only My Account Data (Priority: P2)

**Goal**: Ensure exported files always stay scoped to the authenticated user and respect expired or missing sessions

**Independent Test**: Export as two different users and confirm each file contains only that account's holdings; clear the session and confirm no file is returned

### Verification for User Story 2

- [X] T014 [P] [US2] Add route-level verification for unauthorized and cross-account export isolation in `/Users/cmaier/.codex/worktrees/f921/tcg-tracker/tests/integration/portfolio-export-route.test.ts`
- [X] T015 [P] [US2] Add client-side auth failure redirect coverage for export retries in `/Users/cmaier/.codex/worktrees/f921/tcg-tracker/tests/integration/portfolio-export-button.test.tsx`
- [X] T016 [US2] Add end-to-end coverage for session-protected export behavior in `/Users/cmaier/.codex/worktrees/f921/tcg-tracker/tests/e2e/portfolio.spec.ts`

### Implementation for User Story 2

- [X] T017 [US2] Ensure export row generation always resolves the current authenticated user in `/Users/cmaier/.codex/worktrees/f921/tcg-tracker/lib/portfolio/export-portfolio.ts`
- [X] T018 [US2] Ensure unauthorized export requests return the documented non-download response in `/Users/cmaier/.codex/worktrees/f921/tcg-tracker/app/api/portfolio/export/route.ts`
- [X] T019 [US2] Handle export auth failures on the portfolio page with re-authentication flow in `/Users/cmaier/.codex/worktrees/f921/tcg-tracker/components/portfolio/portfolio-export-button.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Receive Useful Empty-State Feedback (Priority: P3)

**Goal**: Prevent misleading downloads when the portfolio is empty and surface clear empty-state feedback in both UI and route responses

**Independent Test**: Sign in with an empty portfolio, attempt export, and confirm the UI explains there is nothing to export while the route returns the documented empty response

### Verification for User Story 3

- [X] T020 [P] [US3] Add empty-state response assertions for the export route in `/Users/cmaier/.codex/worktrees/f921/tcg-tracker/tests/integration/portfolio-export-route.test.ts`
- [X] T021 [P] [US3] Add empty-state UI coverage for disabled export and surfaced route errors in `/Users/cmaier/.codex/worktrees/f921/tcg-tracker/tests/integration/portfolio-export-button.test.tsx`
- [X] T022 [P] [US3] Add portfolio-page rendering coverage for empty export affordance state in `/Users/cmaier/.codex/worktrees/f921/tcg-tracker/tests/integration/portfolio-page.test.tsx`

### Implementation for User Story 3

- [X] T023 [US3] Return the documented empty export outcome from `/Users/cmaier/.codex/worktrees/f921/tcg-tracker/app/api/portfolio/export/route.ts` when no holdings exist
- [X] T024 [US3] Disable or gate the export control for empty portfolios in `/Users/cmaier/.codex/worktrees/f921/tcg-tracker/app/portfolio/page.tsx` and `/Users/cmaier/.codex/worktrees/f921/tcg-tracker/components/portfolio/portfolio-export-button.tsx`
- [X] T025 [US3] Surface clear empty-state messaging for export on the portfolio page in `/Users/cmaier/.codex/worktrees/f921/tcg-tracker/components/portfolio/portfolio-export-button.tsx` and `/Users/cmaier/.codex/worktrees/f921/tcg-tracker/app/globals.css`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and documentation alignment across stories

- [X] T026 [P] Update regression expectations for the existing portfolio contract in `/Users/cmaier/.codex/worktrees/f921/tcg-tracker/tests/contract/portfolio.contract.test.ts` if export-related shared portfolio mapping changes affect the contract
- [X] T027 Run the documented verification commands and capture any blockers in `/Users/cmaier/.codex/worktrees/f921/tcg-tracker/specs/008-portfolio-spreadsheet-export/quickstart.md`
- [X] T028 [P] Confirm the final implementation keeps repo guidance aligned in `/Users/cmaier/.codex/worktrees/f921/tcg-tracker/AGENTS.md`, `/Users/cmaier/.codex/worktrees/f921/tcg-tracker/README.md`, and `/Users/cmaier/.codex/worktrees/f921/tcg-tracker/docs/development/mcps.md` if commands or tooling changed during implementation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel if staffed
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - establishes the MVP export flow
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - depends on the shared export route and helper but remains independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - depends on the shared export route and UI trigger but remains independently testable

### Within Each User Story

- Verification MUST be defined before implementation
- Automated tests for executable behavior MUST fail before implementation when feasible
- Shared route/helper updates before UI integration
- Core implementation before integration polish
- Story complete before moving to next priority when following MVP-first delivery

### Parallel Opportunities

- T004 and T005 can run in parallel once the foundational export files exist
- T006, T007, and T008 can run in parallel within User Story 1
- T010 and T011 can run in parallel once the export shape is settled
- T014, T015, and T016 can run in parallel within User Story 2
- T020, T021, and T022 can run in parallel within User Story 3
- T026 and T028 can run in parallel during polish

---

## Parallel Example: User Story 1

```bash
# Launch User Story 1 verification tasks together:
Task: "Extend export route verification for full-row CSV content and all-holdings export ordering in /Users/cmaier/.codex/worktrees/f921/tcg-tracker/tests/integration/portfolio-export-route.test.ts"
Task: "Add UI interaction coverage for download success behavior in /Users/cmaier/.codex/worktrees/f921/tcg-tracker/tests/integration/portfolio-export-button.test.tsx"
Task: "Add end-to-end export download coverage from /Users/cmaier/.codex/worktrees/f921/tcg-tracker/tests/e2e/portfolio.spec.ts"

# Launch User Story 1 implementation tasks with disjoint files:
Task: "Implement database-backed and demo-fallback export row shaping in /Users/cmaier/.codex/worktrees/f921/tcg-tracker/lib/portfolio/export-portfolio.ts"
Task: "Implement portfolio export route support for all account holdings and CSV response headers in /Users/cmaier/.codex/worktrees/f921/tcg-tracker/app/api/portfolio/export/route.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Run the User Story 1 integration, contract, and e2e verification plus manual file-open checks
5. Demo or ship the spreadsheet export MVP

### Incremental Delivery

1. Complete Setup + Foundational → foundation ready
2. Add User Story 1 → test independently → demo MVP export
3. Add User Story 2 → test independently → validate account isolation and auth handling
4. Add User Story 3 → test independently → validate empty-state behavior
5. Finish with polish and full verification commands

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Finish with shared regression and documentation review in Phase 6

---

## Notes

- [P] tasks = different files, no dependencies
- [US1], [US2], and [US3] labels map directly to the feature spec user stories
- Each user story remains independently testable per the spec and quickstart
- Prefer making automated tests fail before implementation where the current harness supports it
- Avoid combining JSON portfolio CRUD changes with the export route unless the contract explicitly requires it
