---

description: "Task list for TCG Card Portfolio Tracker implementation"
---

# Tasks: TCG Card Portfolio Tracker

**Input**: Design documents from `/specs/001-card-portfolio-tracker/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Verification tasks are REQUIRED. Prefer automated tests for logic, contracts, and regressions. If automation is not practical, include explicit manual verification tasks with commands, inputs, and expected outcomes.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `app/`, `components/`, `lib/`, `prisma/`, `tests/`
- Paths below assume the single Next.js app structure defined in plan.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and baseline tooling

- [x] T001 Initialize the Next.js and TypeScript workspace in `package.json`, `tsconfig.json`, `next.config.ts`, and `app/layout.tsx`
- [x] T002 [P] Configure local PostgreSQL and app environment scaffolding in `docker/postgres/compose.yml`, `.env.example`, and `.gitignore`
- [x] T003 [P] Configure linting, formatting, and shared package scripts in `eslint.config.mjs`, `prettier.config.mjs`, and `package.json`
- [x] T004 [P] Configure Vitest and Playwright test runners in `vitest.config.ts`, `playwright.config.ts`, and `tests/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create the Prisma data model and initial migration in `prisma/schema.prisma` and `prisma/migrations/`
- [x] T006 [P] Implement the Prisma client and database helpers in `lib/db/prisma.ts` and `lib/db/env.ts`
- [x] T007 [P] Implement upstream API client, payload validation, and sync mapping in `lib/tcgtracking/client.ts`, `lib/tcgtracking/schemas.ts`, and `lib/tcgtracking/mappers.ts`
- [x] T008 Implement catalog sync and price snapshot ingestion services in `lib/tcgtracking/sync-catalog.ts` and `lib/pricing/sync-price-snapshots.ts`
- [x] T009 Implement portfolio valuation calculation and snapshot services in `lib/portfolio/value-portfolio.ts` and `lib/portfolio/save-valuation-snapshot.ts`
- [x] T010 Implement app-wide data fetching and error utilities in `lib/api/http-errors.ts`, `lib/api/route-handler.ts`, and `lib/api/serializers.ts`
- [x] T011 Implement development database lifecycle scripts in `package.json` and `scripts/db-up.mjs`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Browse Cards and Variants (Priority: P1) 🎯 MVP

**Goal**: Users can browse the card catalog, open card detail pages, inspect available variants, and view card images.

**Independent Test**: Start the app, browse to `/cards`, search for a card, open a detail page, and confirm the page shows identifying details, image, and language or variant options without using portfolio features.

### Verification for User Story 1

- [x] T012 [P] [US1] Add contract tests for catalog and card detail endpoints in `tests/contract/cards-search.contract.test.ts` and `tests/contract/card-detail.contract.test.ts`
- [x] T013 [P] [US1] Add integration tests for catalog browse and card detail flows in `tests/integration/cards-browse.test.tsx` and `tests/integration/card-detail.test.tsx`
- [x] T014 [US1] Add Playwright coverage for browsing and variant selection in `tests/e2e/cards-browse.spec.ts`

### Implementation for User Story 1

- [x] T015 [P] [US1] Implement catalog query and card detail services in `lib/tcgtracking/get-card-catalog.ts` and `lib/tcgtracking/get-card-detail.ts`
- [x] T016 [P] [US1] Implement catalog and card detail API routes in `app/api/cards/route.ts` and `app/api/cards/[category]/[cardId]/route.ts`
- [x] T017 [P] [US1] Build shared card list, card detail, and variant selector components in `components/cards/card-list.tsx`, `components/cards/card-detail.tsx`, and `components/cards/variant-selector.tsx`
- [x] T018 [US1] Implement the catalog page in `app/cards/page.tsx`
- [x] T019 [US1] Implement the card detail page in `app/cards/[category]/[cardId]/page.tsx`
- [x] T020 [US1] Add empty states and missing-image handling in `components/cards/card-empty-state.tsx` and `components/cards/card-image.tsx`

**Checkpoint**: User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Inspect Card Pricing History (Priority: P1)

**Goal**: Users can view current card prices and historical price charts for a selected card variation.

**Independent Test**: Open a card detail page for a tracked variation, confirm the latest price and timestamp appear, and verify the history chart or empty state renders without using the portfolio pages.

### Verification for User Story 2

- [x] T021 [P] [US2] Add contract tests for price history responses in `tests/contract/card-history.contract.test.ts`
- [x] T022 [P] [US2] Add integration tests for card pricing sections in `tests/integration/card-pricing.test.tsx`
- [x] T023 [US2] Add Playwright coverage for current price and history chart display in `tests/e2e/card-pricing.spec.ts`

### Implementation for User Story 2

- [x] T024 [P] [US2] Implement price history query and chart shaping services in `lib/pricing/get-current-price.ts` and `lib/pricing/get-price-history.ts`
- [x] T025 [P] [US2] Implement the price history API route in `app/api/cards/[category]/[cardId]/history/route.ts`
- [x] T026 [P] [US2] Build price summary and chart components in `components/charts/price-history-chart.tsx` and `components/cards/card-price-summary.tsx`
- [x] T027 [US2] Integrate current price and history UI into `app/cards/[category]/[cardId]/page.tsx`
- [x] T028 [US2] Add no-price and no-history empty states in `components/cards/card-price-empty-state.tsx`

**Checkpoint**: User Stories 1 and 2 should both work independently

---

## Phase 5: User Story 3 - Track Personal Portfolio Value (Priority: P1)

**Goal**: Users can add card variations to a portfolio, view current portfolio value, and review historical portfolio value.

**Independent Test**: Add a card variation to the portfolio, load `/portfolio`, verify holdings and total value appear, and confirm the historical portfolio chart or empty state renders using saved valuation snapshots.

### Verification for User Story 3

- [x] T029 [P] [US3] Add contract tests for portfolio endpoints in `tests/contract/portfolio.contract.test.ts` and `tests/contract/portfolio-history.contract.test.ts`
- [x] T030 [P] [US3] Add integration tests for portfolio CRUD and valuation updates in `tests/integration/portfolio-page.test.tsx` and `tests/integration/portfolio-service.test.ts`
- [x] T031 [US3] Add Playwright coverage for add-to-portfolio and portfolio history flows in `tests/e2e/portfolio.spec.ts`

### Implementation for User Story 3

- [x] T032 [P] [US3] Implement portfolio query and mutation services in `lib/portfolio/get-portfolio.ts`, `lib/portfolio/add-holding.ts`, `lib/portfolio/update-holding.ts`, and `lib/portfolio/remove-holding.ts`
- [x] T033 [P] [US3] Implement portfolio API routes in `app/api/portfolio/route.ts`, `app/api/portfolio/[holdingId]/route.ts`, and `app/api/portfolio/history/route.ts`
- [x] T034 [P] [US3] Build portfolio list, holding form, and valuation chart components in `components/portfolio/portfolio-list.tsx`, `components/portfolio/holding-form.tsx`, and `components/charts/portfolio-value-chart.tsx`
- [x] T035 [US3] Implement add-to-portfolio UI on the card detail page in `components/portfolio/add-to-portfolio-button.tsx` and `app/cards/[category]/[cardId]/page.tsx`
- [x] T036 [US3] Implement the portfolio page in `app/portfolio/page.tsx`
- [x] T037 [US3] Save a portfolio valuation snapshot after holding add, update, and delete operations in `lib/portfolio/add-holding.ts`, `lib/portfolio/update-holding.ts`, and `lib/portfolio/remove-holding.ts`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T038 [P] Document setup, sync behavior, and verification steps in `README.md` and `specs/001-card-portfolio-tracker/quickstart.md`
- [x] T039 Add a scheduled price and portfolio snapshot runner in `scripts/run-snapshots.mjs` and `app/api/snapshots/route.ts`
- [x] T040 [P] Add unit tests for pricing and portfolio calculations in `tests/unit/value-portfolio.test.ts` and `tests/unit/get-price-history.test.ts`
- [x] T041 Harden validation and route error handling across app APIs in `lib/api/route-handler.ts` and `lib/tcgtracking/schemas.ts`
- [x] T042 Run quickstart validation and capture any follow-up fixes in `specs/001-card-portfolio-tracker/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: Depend on Foundational completion
  - User Stories 1 and 2 can begin in parallel after Foundational
  - User Story 3 depends on Foundational and benefits from User Story 1 card detail UI, but its backend services can begin in parallel
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - no dependency on other user stories
- **User Story 2 (P1)**: Can start after Foundational - reuses card detail UI from US1 for final page integration
- **User Story 3 (P1)**: Can start after Foundational - backend work is independent, while the add-to-portfolio entry point reuses the card detail page from US1

### Within Each User Story

- Verification tasks MUST be defined before implementation
- Contract and integration tests SHOULD fail before implementation when feasible
- Services before API routes
- API routes before page integration
- Story-specific empty states and validation must ship with each story

### Parallel Opportunities

- T002, T003, and T004 can run in parallel during Setup
- T006 and T007 can run in parallel once the workspace exists
- T012, T013, and T014 can run in parallel for User Story 1
- T021, T022, and T023 can run in parallel for User Story 2
- T029, T030, and T031 can run in parallel for User Story 3
- T015, T016, and T017 can run in parallel after User Story 1 verification scaffolding is in place
- T024, T025, and T026 can run in parallel after User Story 2 verification scaffolding is in place
- T032, T033, and T034 can run in parallel after User Story 3 verification scaffolding is in place

---

## Parallel Example: User Story 1

```bash
# Launch verification work for User Story 1 together:
Task: "Add contract tests in tests/contract/cards-search.contract.test.ts and tests/contract/card-detail.contract.test.ts"
Task: "Add integration tests in tests/integration/cards-browse.test.tsx and tests/integration/card-detail.test.tsx"
Task: "Add Playwright coverage in tests/e2e/cards-browse.spec.ts"

# Launch implementation building blocks for User Story 1 together:
Task: "Implement catalog query services in lib/tcgtracking/get-card-catalog.ts and lib/tcgtracking/get-card-detail.ts"
Task: "Implement API routes in app/api/cards/route.ts and app/api/cards/[category]/[cardId]/route.ts"
Task: "Build card UI components in components/cards/card-list.tsx, components/cards/card-detail.tsx, and components/cards/variant-selector.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Verify catalog browsing, card images, and variant selection independently
5. Demo the catalog flow before layering pricing and portfolio features

### Incremental Delivery

1. Complete Setup + Foundational
2. Add User Story 1 and validate browse/detail behavior
3. Add User Story 2 and validate current-price plus historical chart behavior
4. Add User Story 3 and validate portfolio CRUD plus valuation history
5. Finish scheduled snapshots, docs, and hardening

### Parallel Team Strategy

1. Team completes Setup + Foundational together
2. After Foundation is complete:
   - Developer A: User Story 1 catalog and detail experience
   - Developer B: User Story 2 pricing and charting
   - Developer C: User Story 3 portfolio backend and UI
3. Merge story work at the shared card detail page and final polish phase

---

## Notes

- All tasks follow the required checklist format with IDs, optional `[P]`, story labels where required, and exact file paths
- User stories remain independently testable even though all three are `P1`
- Suggested MVP scope is still **User Story 1** because it unlocks the first usable collector workflow with the least dependency surface
