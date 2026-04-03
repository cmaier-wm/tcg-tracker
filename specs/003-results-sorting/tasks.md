# Tasks: Results Sorting

**Input**: Design documents from `/Users/cmaier/Source/tcg-tracker/specs/003-results-sorting/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/cards-sorting.md, quickstart.md

**Tests**: Verification tasks are REQUIRED. Prefer automated tests for the sort
logic, browse UI behavior, and catalog contract handling.

**Organization**: Tasks are grouped by user story to enable independent
implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g. `US1`, `US2`, `US3`)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the feature scaffolding and task targets before behavior changes.

- [X] T001 Confirm the final scope, sort options, and implementation boundaries in `/Users/cmaier/Source/tcg-tracker/specs/003-results-sorting/spec.md` and `/Users/cmaier/Source/tcg-tracker/specs/003-results-sorting/plan.md`
- [X] T002 Review the shared browse flow touchpoints in `/Users/cmaier/Source/tcg-tracker/components/cards/cards-browser-page.tsx`, `/Users/cmaier/Source/tcg-tracker/components/cards/catalog-filters.tsx`, `/Users/cmaier/Source/tcg-tracker/components/cards/infinite-card-list.tsx`, `/Users/cmaier/Source/tcg-tracker/app/page.tsx`, `/Users/cmaier/Source/tcg-tracker/app/cards/page.tsx`, and `/Users/cmaier/Source/tcg-tracker/app/api/cards/route.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add the shared sorting model and request normalization that every story depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 Create the shared sort option and normalization helpers for bidirectional price, name, number, set, and rarity sorting in `/Users/cmaier/Source/tcg-tracker/lib/tcgtracking/search-query.ts`
- [X] T004 Update `/Users/cmaier/Source/tcg-tracker/lib/tcgtracking/get-card-catalog.ts` to accept an explicit sort option and apply normalized request state before pagination
- [X] T005 [P] Extend `/Users/cmaier/Source/tcg-tracker/lib/tcgtracking/db-catalog.ts` request types so database-backed catalog fetches can participate in the shared sort flow
- [X] T006 [P] Add or update unit coverage for sort parsing, normalization, and field ordering in `/Users/cmaier/Source/tcg-tracker/tests/unit/search-query.test.ts`

**Checkpoint**: Shared sort state is defined and catalog fetchers can accept a sort parameter consistently.

---

## Phase 3: User Story 1 - Change Result Order (Priority: P1) 🎯 MVP

**Goal**: Users can choose between supported sort orders without losing their current search or set filters.

**Independent Test**: Open the browse page, switch the sort control, and confirm the same filtered result set reorders while preserving active query and set filters.

### Verification for User Story 1

- [X] T007 [P] [US1] Add browse-page integration coverage for the sort control and preserved filter state in `/Users/cmaier/Source/tcg-tracker/tests/integration/cards-browse.test.tsx`
- [X] T008 [P] [US1] Extend the cards catalog contract coverage for the `sort` query parameter in `/Users/cmaier/Source/tcg-tracker/tests/contract/cards-search.contract.test.ts`
- [X] T009 [US1] Update manual verification steps for every supported sort field and direction in `/Users/cmaier/Source/tcg-tracker/specs/003-results-sorting/quickstart.md`

### Implementation for User Story 1

- [X] T010 [US1] Add the visible sort control to `/Users/cmaier/Source/tcg-tracker/components/cards/catalog-filters.tsx`
- [X] T011 [US1] Thread the selected sort value through `/Users/cmaier/Source/tcg-tracker/components/cards/cards-browser-page.tsx`, `/Users/cmaier/Source/tcg-tracker/app/page.tsx`, and `/Users/cmaier/Source/tcg-tracker/app/cards/page.tsx`
- [X] T012 [US1] Preserve the active sort value in infinite-scroll fetches in `/Users/cmaier/Source/tcg-tracker/components/cards/infinite-card-list.tsx`
- [X] T013 [US1] Normalize and forward the `sort` query parameter in `/Users/cmaier/Source/tcg-tracker/app/api/cards/route.ts`
- [X] T014 [US1] Implement shared result ordering for the supported sort options in `/Users/cmaier/Source/tcg-tracker/lib/tcgtracking/get-card-catalog.ts`

**Checkpoint**: Users can select a sort order and see consistent reordering across initial page load and infinite-scroll fetches.

---

## Phase 4: User Story 2 - See Highest-Value Cards First on Home (Priority: P1)

**Goal**: The home page defaults to highest-priced cards first when no explicit sort is chosen.

**Independent Test**: Open `/` with no `sort` query parameter and confirm the first visible results are ordered by descending price.

### Verification for User Story 2

- [X] T015 [P] [US2] Add integration coverage for the home-page default sort in `/Users/cmaier/Source/tcg-tracker/tests/integration/cards-browse.test.tsx`
- [X] T016 [P] [US2] Add contract coverage for default sort normalization in `/Users/cmaier/Source/tcg-tracker/tests/contract/cards-search.contract.test.ts`

### Implementation for User Story 2

- [X] T017 [US2] Apply `price-desc` as the default home-page sort in `/Users/cmaier/Source/tcg-tracker/app/page.tsx` and `/Users/cmaier/Source/tcg-tracker/components/cards/cards-browser-page.tsx`
- [X] T018 [US2] Ensure the cards route and cards API route normalize missing or invalid sort values to the supported default in `/Users/cmaier/Source/tcg-tracker/app/cards/page.tsx` and `/Users/cmaier/Source/tcg-tracker/app/api/cards/route.ts`
- [X] T019 [US2] Keep the active sort selection visibly synced with the normalized default in `/Users/cmaier/Source/tcg-tracker/components/cards/catalog-filters.tsx`

**Checkpoint**: The home page behaves as highest-price-first by default while still allowing explicit user overrides.

---

## Phase 5: User Story 3 - Handle Missing Prices During Sorting (Priority: P2)

**Goal**: Price sorting remains sensible and stable when cards are missing price data or share the same price.

**Independent Test**: Load a mixed priced/unpriced result set and confirm priced items sort first, unpriced items trail afterward, and ties remain deterministic.

### Verification for User Story 3

- [X] T020 [P] [US3] Add unit coverage for missing-price, tie-break ordering, and normalized rarity/number/set ordering in `/Users/cmaier/Source/tcg-tracker/tests/unit/search-query.test.ts`
- [X] T021 [P] [US3] Add contract coverage for mixed priced/unpriced result ordering and supported sort directions in `/Users/cmaier/Source/tcg-tracker/tests/contract/cards-search.contract.test.ts`
- [X] T022 [US3] Expand manual verification notes for mixed priced/unpriced catalogs in `/Users/cmaier/Source/tcg-tracker/specs/003-results-sorting/quickstart.md`

### Implementation for User Story 3

- [X] T023 [US3] Implement stable missing-price and tie-break ordering rules in `/Users/cmaier/Source/tcg-tracker/lib/tcgtracking/get-card-catalog.ts`
- [X] T024 [P] [US3] Ensure database-backed catalog mapping exposes the fields needed for stable ordering in `/Users/cmaier/Source/tcg-tracker/lib/tcgtracking/db-catalog.ts`
- [X] T025 [P] [US3] Ensure demo-store mapping remains consistent with the shared ordering rules in `/Users/cmaier/Source/tcg-tracker/lib/tcgtracking/mappers.ts`

**Checkpoint**: Price sorting behaves predictably for mixed and tied result sets in both database and demo fallback modes.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency, documentation, and verification across the full feature.

- [X] T026 [P] Update the feature quickstart with final commands and expected outcomes in `/Users/cmaier/Source/tcg-tracker/specs/003-results-sorting/quickstart.md`
- [X] T027 [P] Review any contributor or agent guidance affected by the final sort behavior in `/Users/cmaier/Source/tcg-tracker/README.md` and `/Users/cmaier/Source/tcg-tracker/AGENTS.md`
- [X] T028 Run the full targeted verification suite for results sorting and record outcomes in `/Users/cmaier/Source/tcg-tracker/specs/003-results-sorting/tasks.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories
- **User Story Phases (Phase 3 onward)**: Depend on Foundational completion
- **Polish (Phase 6)**: Depends on all targeted user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational and delivers the MVP sort control
- **User Story 2 (P1)**: Starts after User Story 1 because the default behavior depends on the visible sort flow already existing
- **User Story 3 (P2)**: Starts after User Story 1 and can overlap with late User Story 2 work once shared sorting is in place

### Within Each User Story

- Verification tasks should be authored before or alongside implementation
- Shared UI wiring should land before infinite-scroll or API propagation checks
- Ordering logic should be implemented before final contract verification

### Parallel Opportunities

- `T005` and `T006` can run in parallel once `T003` and `T004` define the shared sort model
- In **US1**, `T007` and `T008` can run in parallel, then `T010` and `T013` can proceed in parallel on separate files
- In **US2**, `T015` and `T016` can run in parallel
- In **US3**, `T020` and `T021` can run in parallel, and `T024` and `T025` can run in parallel after `T023` defines the shared ordering rules

---

## Parallel Example: User Story 1

```bash
# Verification work in parallel:
Task: "Add browse-page integration coverage for the sort control and preserved filter state in tests/integration/cards-browse.test.tsx"
Task: "Extend the cards catalog contract coverage for the sort query parameter in tests/contract/cards-search.contract.test.ts"

# Implementation work in parallel after shared sort state is wired:
Task: "Add the visible sort control to components/cards/catalog-filters.tsx"
Task: "Normalize and forward the sort query parameter in app/api/cards/route.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate sort selection, filter preservation, and infinite-scroll consistency

### Incremental Delivery

1. Deliver the explicit sort control and shared sort propagation
2. Add the home-page default highest-price-first behavior
3. Add missing-price and stable tie-break ordering polish
4. Run final verification and document outcomes

### Parallel Team Strategy

With multiple developers:

1. One developer completes the foundational sort model
2. A second developer prepares browse-page tests while the first wires shared sorting
3. After MVP sort control lands, one developer handles default home-page behavior while another hardens missing-price ordering

---

## Notes

- [P] tasks touch separate files and do not depend on incomplete work in the same phase
- Every user story remains independently testable from the acceptance criteria in `spec.md`
- The suggested MVP scope is **User Story 1** only
- All tasks use the required checklist format with task ID, optional parallel marker, story label where required, and exact file paths

## Verification Results

- `npm run test:unit -- tests/unit/search-query.test.ts`
- `npm run test:integration -- tests/integration/cards-browse.test.tsx tests/contract/cards-search.contract.test.ts`
- `npm run test:e2e`
