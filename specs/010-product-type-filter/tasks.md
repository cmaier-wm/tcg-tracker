# Tasks: Product Type Filter

**Input**: Design documents from `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/specs/010-product-type-filter/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/home-product-type-filter.md, quickstart.md

**Tests**: Verification tasks are REQUIRED. Prefer automated tests for shared
browse normalization, API contracts, web UI regressions, browser console
cleanliness, and iOS browse-state behavior. Use manual quickstart verification
only to cover final UI checks not already automated.

**Organization**: Tasks are grouped by user story to enable independent
implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g. `US1`, `US2`, `US3`)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the feature artifacts, browse scope, and implementation
boundaries before code changes begin.

- [X] T001 Review `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/specs/010-product-type-filter/spec.md`, `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/specs/010-product-type-filter/plan.md`, and `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/specs/010-product-type-filter/contracts/home-product-type-filter.md` to lock the `productType` values, default behavior, and sealed-product browse-only scope
- [X] T002 Review the existing shared browse touchpoints in `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/app/page.tsx`, `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/components/cards/cards-browser-page.tsx`, `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/components/cards/catalog-filters.tsx`, `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/components/cards/infinite-card-list.tsx`, `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/app/api/cards/route.ts`, `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/ios/TCGTracker/State/BrowseStore.swift`, and `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/ios/TCGTracker/Features/Browse/BrowseView.swift`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Define the shared browse-state model and contract changes that all
stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 Create shared `productType` option, normalization, and request helpers in `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/lib/tcgtracking/search-query.ts`
- [X] T004 Update `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/lib/tcgtracking/mappers.ts` and `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/lib/tcgtracking/get-card-catalog.ts` so catalog list items and fetch options carry `productType`
- [X] T005 [P] Extend `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/lib/tcgtracking/db-catalog.ts` to accept the normalized `productType` filter in database-backed catalog fetches
- [X] T006 [P] Add unit coverage for `productType` normalization and invalid-value fallback in `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/tests/unit/search-query.test.ts`

**Checkpoint**: Shared browse-state normalization and catalog fetch inputs are ready for story-level implementation.

---

## Phase 3: User Story 1 - Filter Home Results by Product Type (Priority: P1) 🎯 MVP

**Goal**: Users can switch the home-page browse results between Cards and Sealed
Product.

**Independent Test**: Open `/`, switch the product-type filter between Cards and
Sealed Product, and confirm the visible results update to only the selected
type without leaving the page.

### Verification for User Story 1

- [X] T007 [P] [US1] Add contract coverage for the `productType` query parameter and filtered response items in `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/tests/contract/cards-search.contract.test.ts`
- [X] T008 [P] [US1] Add integration coverage for the home-page product-type control and filtered result rendering in `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/tests/integration/cards-browser-page.test.tsx` and `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/tests/integration/catalog-filters.test.tsx`
- [X] T009 [P] [US1] Add browser console-clean verification for switching between Cards and Sealed Product on `/` in `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/tests/e2e/home-product-type-filter.spec.ts`
- [X] T010 [P] [US1] Add iOS browse-store verification for product-type switching requests and filtered result handling in `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/ios/TCGTrackerTests/BrowseStoreTests.swift`
- [X] T011 [P] [US1] Add explicit web verification that sealed-product rows render without card-only metadata assumptions or card-detail navigation in `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/tests/integration/cards-browser-page.test.tsx`
- [X] T012 [P] [US1] Add explicit iOS verification that sealed-product rows remain browse-only and do not trigger card-detail navigation in `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/ios/TCGTrackerTests/BrowseStoreTests.swift`
- [X] T013 [US1] Document manual web and iOS product-type switching checks in `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/specs/010-product-type-filter/quickstart.md`

### Implementation for User Story 1

- [X] T014 [US1] Thread the home-page `productType` selection through `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/app/page.tsx` and `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/components/cards/cards-browser-page.tsx`, including the `Cards` label to `productType=card` mapping
- [X] T015 [US1] Add the visible Cards vs Sealed Product filter control and query-string updates in `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/components/cards/catalog-filters.tsx`
- [X] T016 [US1] Preserve the selected `productType` in incremental fetches from `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/components/cards/infinite-card-list.tsx`
- [X] T017 [US1] Normalize and forward the `productType` query parameter in `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/app/api/cards/route.ts`
- [X] T018 [US1] Implement filtered catalog retrieval for Cards and Sealed Product in `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/lib/tcgtracking/get-card-catalog.ts` and `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/lib/tcgtracking/db-catalog.ts`
- [X] T019 [US1] Implement explicit sealed-product row rendering and card-detail navigation guards in `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/components/cards/cards-browser-page.tsx` and `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/components/cards/infinite-card-list.tsx`
- [X] T020 [US1] Extend the shared browse response and request model for iOS in `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/ios/TCGTracker/Models/APIModels.swift`, `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/ios/TCGTracker/Networking/APIClient.swift`, `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/ios/TCGTracker/State/BrowseStore.swift`, and `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/ios/TCGTracker/Features/Browse/BrowseView.swift`
- [X] T021 [US1] Implement explicit iOS browse-row interaction rules so sealed-product rows remain browse-only in `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/ios/TCGTracker/Features/Browse/BrowseView.swift` and `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/ios/TCGTracker/State/BrowseStore.swift`

**Checkpoint**: Users can switch the home-page browse mode on web and iOS and see only items of the selected product type.

---

## Phase 4: User Story 2 - Default Home View to Cards (Priority: P1)

**Goal**: The home page and iOS browse screen default to Cards whenever no
explicit product-type selection is present.

**Independent Test**: Open the home browse experience with no `productType`
selection and confirm Cards is visibly active and only card results are shown.

### Verification for User Story 2

- [X] T022 [P] [US2] Add integration coverage for the default Cards state on initial home-page load in `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/tests/integration/cards-browser-page.test.tsx`
- [X] T023 [P] [US2] Extend contract coverage for omitted or invalid `productType` fallback to Cards in `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/tests/contract/cards-search.contract.test.ts`
- [X] T024 [P] [US2] Add Playwright coverage for default Cards selection and console cleanliness on `/` in `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/tests/e2e/home-product-type-filter.spec.ts`
- [X] T025 [P] [US2] Add iOS browse-store verification for default Cards requests in `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/ios/TCGTrackerTests/BrowseStoreTests.swift`

### Implementation for User Story 2

- [X] T026 [US2] Apply Cards as the normalized default home-page `productType` in `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/app/page.tsx`, `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/components/cards/cards-browser-page.tsx`, and `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/components/cards/catalog-filters.tsx`
- [X] T027 [US2] Ensure the cards API route and shared catalog helpers fall back to Cards when `productType` is omitted or invalid in `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/app/api/cards/route.ts`, `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/lib/tcgtracking/search-query.ts`, and `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/lib/tcgtracking/get-card-catalog.ts`
- [X] T028 [US2] Apply the same default Cards behavior to iOS browse initialization in `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/ios/TCGTracker/State/BrowseStore.swift` and `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/ios/TCGTracker/Features/Browse/BrowseView.swift`

**Checkpoint**: Both clients default to Cards without requiring explicit user input or stored preference state.

---

## Phase 5: User Story 3 - Preserve Search and Sort While Changing Product Type (Priority: P2)

**Goal**: Product-type changes keep existing search and sort context intact.

**Independent Test**: Apply a search term or sort, switch product type, and
confirm the same query and sort remain active while the result set changes to
the selected type.

### Verification for User Story 3

- [X] T029 [P] [US3] Add integration coverage for preserving query and sort while `productType` changes in `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/tests/integration/catalog-filters.test.tsx` and `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/tests/integration/cards-browser-page.test.tsx`
- [X] T030 [P] [US3] Extend contract coverage for combined `q`, `sort`, and `productType` requests in `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/tests/contract/cards-search.contract.test.ts`
- [X] T031 [P] [US3] Extend Playwright verification for switching `productType` while search and sort are active in `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/tests/e2e/home-product-type-filter.spec.ts`
- [X] T032 [P] [US3] Add iOS browse-store verification for preserving query and sort across product-type changes in `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/ios/TCGTrackerTests/BrowseStoreTests.swift`

### Implementation for User Story 3

- [X] T033 [US3] Preserve `q`, `set`, `sort`, and `productType` together during form submissions and reset behavior in `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/components/cards/catalog-filters.tsx`
- [X] T034 [US3] Preserve the selected `productType` in list-state keys and incremental fetch parameters in `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/components/cards/cards-browser-page.tsx` and `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/components/cards/infinite-card-list.tsx`
- [X] T035 [US3] Ensure shared browse requests and iOS state updates keep query and sort intact when `productType` changes in `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/app/api/cards/route.ts`, `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/ios/TCGTracker/Networking/APIClient.swift`, `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/ios/TCGTracker/State/BrowseStore.swift`, and `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/ios/TCGTracker/Features/Browse/BrowseView.swift`
- [X] T036 [US3] Add selected-type-specific empty-state messaging without breaking preserved search/sort context in `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/components/cards/cards-browser-page.tsx`, `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/components/cards/card-empty-state.tsx`, and `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/app/globals.css`

**Checkpoint**: Search and sort remain stable while users change product type, including empty-state scenarios.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, documentation, and repo-guidance alignment
across the full feature.

- [X] T037 [P] Update final verification commands and expected outcomes in `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/specs/010-product-type-filter/quickstart.md`
- [X] T038 [P] Review `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/AGENTS.md`, `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/README.md`, and `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/docs/development/mcps.md` for any guidance that changed during implementation
- [X] T039 Run the targeted verification suite for the product-type filter and record outcomes in `/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/specs/010-product-type-filter/tasks.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories
- **User Story Phases (Phase 3 onward)**: Depend on Foundational completion
- **Polish (Phase 6)**: Depends on all targeted user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational and delivers the MVP product-type switcher
- **User Story 2 (P1)**: Starts after User Story 1 because the default behavior depends on the visible product-type flow already existing
- **User Story 3 (P2)**: Starts after User Story 1 and can overlap with late User Story 2 work once shared `productType` state is wired

### Within Each User Story

- Verification tasks should be authored before or alongside implementation
- Shared request and model updates should land before UI-only refinements
- Web control wiring should land before infinite-scroll and reset-state hardening
- iOS browse-state changes should land before final simulator smoke checks

### Parallel Opportunities

- `T005` and `T006` can run in parallel once `T003` and `T004` define the shared browse model
- In **US1**, `T007`, `T008`, `T009`, `T010`, `T011`, and `T012` can run in parallel, then `T015`, `T017`, `T019`, and `T020` can proceed in parallel on separate files
- In **US2**, `T022`, `T023`, `T024`, and `T025` can run in parallel
- In **US3**, `T029`, `T030`, `T031`, and `T032` can run in parallel, then `T034` and `T036` can proceed in parallel after the shared state wiring is defined

---

## Parallel Example: User Story 1

```bash
# Launch User Story 1 verification tasks together:
Task: "Add contract coverage for the productType query parameter in /Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/tests/contract/cards-search.contract.test.ts"
Task: "Add integration coverage for the home-page product-type control in /Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/tests/integration/cards-browser-page.test.tsx and /Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/tests/integration/catalog-filters.test.tsx"
Task: "Add iOS browse-store verification for product-type switching in /Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/ios/TCGTrackerTests/BrowseStoreTests.swift"

# Launch User Story 1 implementation tasks with disjoint files:
Task: "Add the visible Cards vs Sealed Product filter control in /Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/components/cards/catalog-filters.tsx"
Task: "Normalize and forward the productType query parameter in /Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/app/api/cards/route.ts"
Task: "Extend the iOS browse request and state model in /Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/ios/TCGTracker/Models/APIModels.swift and /Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/ios/TCGTracker/State/BrowseStore.swift"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Confirm web and iOS can switch between Cards and Sealed Product independently

### Incremental Delivery

1. Deliver shared `productType` normalization and filtered browse plumbing
2. Add the visible cross-platform product-type switcher
3. Add default Cards behavior for first-load browsing
4. Add search/sort preservation and empty-state refinement
5. Finish with full verification and documentation updates

### Parallel Team Strategy

With multiple developers:

1. One developer completes the foundational browse-model changes
2. A second developer prepares contract and integration coverage while the shared model lands
3. After US1 lands, one developer handles default Cards behavior while another hardens search/sort preservation and empty-state behavior

---

## Notes

- [P] tasks touch separate files and do not depend on incomplete work in the same phase
- [US1], [US2], and [US3] labels map directly to the feature spec user stories
- Each user story remains independently testable per the spec and quickstart
- The suggested MVP scope is **User Story 1** only
- All tasks use the required checklist format with task ID, optional parallel marker, story label where required, and exact file paths

## Verification Outcomes

- `npm run test:unit -- tests/unit/search-query.test.ts` passed.
- `npm run test:integration -- tests/integration/cards-browser-page.test.tsx tests/integration/cards-browse.test.tsx tests/integration/catalog-filters.test.tsx tests/contract/cards-search.contract.test.ts` passed.
- `DATABASE_URL='postgresql://postgres:postgres@localhost:5432/tcg_tracker?schema=public' AUTH_SECRET='local-secret' TEAMS_WEBHOOK_ENCRYPTION_KEY='local-secret' npm run test:e2e -- tests/e2e/home-product-type-filter.spec.ts` passed.
- `cd ios && swift test --filter BrowseStoreTests` passed.
- iOS Simulator manual verification on booted `iPhone 17 Pro` confirmed `Type = Cards` by default, `Type = Sealed Product` renders browse-only rows, and tapping a sealed row keeps the user on `Browse`.
- Playwright MCP navigation could not be completed in this environment because the MCP attempted to create `/.playwright-mcp` on a read-only root filesystem; browser-level behavior was verified with the Playwright test runner instead.
